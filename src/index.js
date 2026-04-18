/**
 * src/index.js
 * Iris Bot – Main entry point
 * WhatsApp bot powered by Baileys with AI responses and scheduled games
 */

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const config = require('./config')
const { handleAIMessage, learnResponse } = require('./commands/ai')
const { startDailyGames, showLeaderboard, playAnimeQuiz, playWaifuGuess, playMangaTrivia, playShippingGame } = require('./commands/games')

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Safely extract plain text from a Baileys message object.
 */
function extractText(msg) {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        ''
    )
}

// ─── Bot Startup ───────────────────────────────────────────────────────────────

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    })

    // Persist credentials on update
    sock.ev.on('creds.update', saveCreds)

    // ── Connection state handler ─────────────────────────────────────────────
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (connection === 'close') {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('🔌 Connexion fermée. Reconnexion :', shouldReconnect)
            if (shouldReconnect) startBot()
        } else if (connection === 'open') {
            console.log('✅ Iris Bot connecté ! 🌸')

            // ── Initialize scheduled games ─────────────────────────────────
            if (config.gamesConfig?.enabled) {
                // Replace with your actual group JID (e.g. "1234567890-1234567890@g.us")
                // You can also set this via an environment variable: process.env.GROUP_JID
                const groupJid = process.env.GROUP_JID || null
                if (groupJid) {
                    startDailyGames(sock, groupJid)
                    console.log(`🎮 Jeux quotidiens activés pour le groupe : ${groupJid}`)
                } else {
                    console.warn('⚠️  GROUP_JID non défini. Les jeux du soir sont désactivés.')
                    console.warn('   Définissez la variable d\'environnement GROUP_JID avec le JID du groupe.')
                }
            }
        }
    })

    // ── Message handler ──────────────────────────────────────────────────────
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        // Only process new incoming messages
        if (type !== 'notify') return

        const msg = messages[0]
        if (!msg?.message) return

        // Ignore messages sent by the bot itself
        if (msg.key.fromMe) return

        const jid = msg.key.remoteJid
        const text = extractText(msg)

        if (!text) return

        const lower = text.toLowerCase().trim()
        console.log(`📩 [${jid}] ${msg.pushName || 'Inconnu'}: ${text}`)

        // ── Built-in keyword commands ──────────────────────────────────────
        if (lower === 'menu') {
            const menuText =
                `🌸 *Menu Iris Bot* 🌸\n\n` +
                config.menu.join('\n') +
                `\n\n🤖 *Commandes IA & Jeux :*\n` +
                `• Mentionne-moi ou écris "Iris, ..." pour me parler\n` +
                `• !learn <question> | <réponse> — M'apprendre quelque chose\n` +
                `• !quiz — Lancer un quiz anime\n` +
                `• !waifu — Jeu de devinette de personnage\n` +
                `• !trivia — Trivia manga\n` +
                `• !ship — Jeu de shipping\n` +
                `• !leaderboard / !scores — Classement général\n\n` +
                `🎮 Jeux automatiques chaque soir à *20h* !`
            await sock.sendMessage(jid, { text: menuText })
            return
        }

        if (lower === 'règles' || lower === 'regles') {
            await sock.sendMessage(jid, { text: config.rules.join('\n') })
            return
        }

        if (lower === 'info') {
            await sock.sendMessage(jid, { text: config.info })
            return
        }

        // ── Game commands ──────────────────────────────────────────────────
        if (lower === '!quiz') {
            await playAnimeQuiz(sock, jid)
            return
        }

        if (lower === '!waifu') {
            await playWaifuGuess(sock, jid)
            return
        }

        if (lower === '!trivia') {
            await playMangaTrivia(sock, jid)
            return
        }

        if (lower === '!ship') {
            await playShippingGame(sock, jid)
            return
        }

        if (lower === '!leaderboard' || lower === '!scores' || lower === '!ranking') {
            await showLeaderboard(sock, jid)
            return
        }

        // ── AI handler (mentions, DMs, !learn, name triggers) ─────────────
        if (config.aiConfig?.enabled) {
            await handleAIMessage(sock, msg)
        }
    })
}

startBot()
