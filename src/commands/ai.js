/**
 * src/commands/ai.js
 * Conversational AI module for Iris Bot
 * Handles pattern-matching responses, SQLite-based learning, and message handling
 */

const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const config = require('../config')

// ─── Database Setup ────────────────────────────────────────────────────────────

const DB_PATH = path.join(__dirname, '../db/learning.db')

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erreur connexion DB:', err.message)
    } else {
        console.log('✅ Base de données connectée:', DB_PATH)
        initDB()
    }
})

function initDB() {
    db.run(`
        CREATE TABLE IF NOT EXISTS conversations (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            question  TEXT NOT NULL,
            answer    TEXT NOT NULL,
            count     INTEGER DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
    db.run(`
        CREATE TABLE IF NOT EXISTS game_scores (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            userId    TEXT NOT NULL,
            username  TEXT,
            gameType  TEXT NOT NULL,
            score     INTEGER DEFAULT 0,
            date      DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
}

// ─── Learning Functions ────────────────────────────────────────────────────────

/**
 * Store a Q&A pair in the database.
 * If the question already exists, increment its count.
 * @param {string} question
 * @param {string} answer
 */
async function learnResponse(question, answer) {
    return new Promise((resolve, reject) => {
        const q = question.toLowerCase().trim()
        db.get(
            'SELECT id, count FROM conversations WHERE question = ?',
            [q],
            (err, row) => {
                if (err) return reject(err)
                if (row) {
                    db.run(
                        'UPDATE conversations SET answer = ?, count = count + 1 WHERE id = ?',
                        [answer, row.id],
                        (err2) => (err2 ? reject(err2) : resolve({ updated: true }))
                    )
                } else {
                    db.run(
                        'INSERT INTO conversations (question, answer) VALUES (?, ?)',
                        [q, answer],
                        (err2) => (err2 ? reject(err2) : resolve({ inserted: true }))
                    )
                }
            }
        )
    })
}

/**
 * Retrieve a response for the given text.
 * Priority: 1) Learned DB response  2) Pattern-based response  3) Fallback
 * @param {string} text
 * @returns {Promise<string>}
 */
async function getResponse(text) {
    const lower = text.toLowerCase().trim()

    // 1. Check learned responses first
    const learned = await new Promise((resolve, reject) => {
        db.get(
            'SELECT answer FROM conversations WHERE ? LIKE "%" || question || "%" ORDER BY count DESC LIMIT 1',
            [lower],
            (err, row) => (err ? reject(err) : resolve(row))
        )
    })
    if (learned) return learned.answer

    // 2. Pattern-based responses from config
    if (config.animeTopics) {
        for (const topic of config.animeTopics) {
            if (lower.includes(topic.keyword.toLowerCase())) {
                return topic.response
            }
        }
    }

    // 3. Built-in personality patterns
    for (const pattern of PERSONALITY_PATTERNS) {
        if (pattern.test.test(lower)) {
            const responses = pattern.responses
            return responses[Math.floor(Math.random() * responses.length)]
        }
    }

    // 4. Fallback
    const fallbacks = [
        "Hmm, je ne suis pas sûre de comprendre... 🤔 Parle-moi d'anime plutôt !",
        "Sumimasen, je n'ai pas bien saisi ! 😅 Tu peux reformuler ?",
        "Ara ara~ je ne connais pas encore la réponse, mais j'apprends ! 📚",
        "Gomen nasai ! Je suis encore en train d'apprendre. 🌸 Essaie !learn pour m'apprendre quelque chose !",
    ]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
}

// ─── Personality Patterns ──────────────────────────────────────────────────────

const PERSONALITY_PATTERNS = [
    {
        test: /\b(bonjour|salut|coucou|yo|hey|ohayo|konnichiwa)\b/,
        responses: [
            "Ohayou gozaimasu ! 🌸 Bienvenue, nakama !",
            "Konnichiwa ! 😊 Comment tu vas aujourd'hui ?",
            "Yaho~ ! 🎉 Content de te voir ici !",
            "Salut salut ! 🍙 Prêt pour une dose d'otaku culture ?",
        ],
    },
    {
        test: /\b(anime|manga|otaku)\b/,
        responses: [
            "Ah, un sujet qui me passionne ! 🎌 Tu regardes quoi en ce moment ?",
            "Otaku pride ! ✊ Quel est ton anime du moment ?",
            "On est entre nakamas ici ! 🌸 Dis-moi tout sur tes animes préférés !",
        ],
    },
    {
        test: /\b(waifu|husbando)\b/,
        responses: [
            "Ara ara~ un homme/une femme de culture ! 💕 Qui est l'élu(e) de ton cœur ?",
            "Waifu wars incoming ! ⚔️ Défends ton choix !",
            "Le débat éternel commence... 😂 Qui est la meilleure waifu selon toi ?",
        ],
    },
    {
        test: /\b(naruto|sasuke|sakura|kakashi)\b/,
        responses: [
            "Dattebayo ! 🌀 Naruto reste un classique indétrônable !",
            "Believe it ! 💪 Quel arc de Naruto tu préfères ?",
            "Konoha forever ! 🍃 Team Naruto ou Team Sasuke ?",
        ],
    },
    {
        test: /\b(one piece|luffy|zoro|nami|sanji)\b/,
        responses: [
            "Luffy va devenir Roi des Pirates, c'est certain ! ☠️",
            "Gomu Gomu no... 🥊 Quel membre du Chapeau de Paille tu préfères ?",
            "One Piece est réel ! 🗺️ T'en es où dans le manga ?",
        ],
    },
    {
        test: /\b(demon slayer|kimetsu|tanjiro|nezuko)\b/,
        responses: [
            "Nezuko-chan est trop mignonne ! 🎋 Tu as vu la saison 3 ?",
            "Hinokami Kagura ! 🔥 Quel Pilier est ton préféré ?",
            "Kimetsu no Yaiba a des animations incroyables ! ✨",
        ],
    },
    {
        test: /\b(attack on titan|aot|eren|mikasa|levi)\b/,
        responses: [
            "Tatakae ! Tatakae ! ⚔️ L'histoire d'Eren est tellement complexe...",
            "Levi est le soldat le plus fort de l'humanité ! 💪",
            "La fin d'AoT a divisé la communauté... 🤔 T'en penses quoi ?",
        ],
    },
    {
        test: /\b(jujutsu|gojo|yuji|itadori|sukuna)\b/,
        responses: [
            "Gojo Satoru est imbattable ! 😎 Infinity go brrr~",
            "Jujutsu Kaisen a des combats de folie ! ⚡ Ton personnage préféré ?",
            "Ryomen Sukuna est un antagoniste fascinant ! 👹",
        ],
    },
    {
        test: /\b(merci|thanks|arigatou|arigato)\b/,
        responses: [
            "Dou itashimashite ! 🌸 C'est avec plaisir !",
            "Pas de souci nakama ! 😊",
            "Itsumo ! 💕 Je suis là pour ça !",
        ],
    },
    {
        test: /\b(quiz|jeu|game|jouer)\b/,
        responses: [
            "Tu veux jouer ? 🎮 Tape !quiz pour un quiz anime ou attends 20h pour les jeux du soir !",
            "Game time ! 🎯 Les jeux du soir commencent à 20h, sois là !",
            "J'adore les jeux ! 🎉 Tape !scores pour voir le classement !",
        ],
    },
    {
        test: /\b(score|classement|leaderboard|ranking)\b/,
        responses: [
            "Tu veux voir le classement ? 🏆 Tape !leaderboard pour les scores !",
            "Les meilleurs joueurs sont récompensés ! 🥇 Tape !scores pour voir !",
        ],
    },
    {
        test: /\b(triste|sad|déprimé|déprime|nul|naze)\b/,
        responses: [
            "Ganbatte ! 💪 Ne lâche pas, nakama ! Les personnages d'anime surmontent tout !",
            "Même Naruto a eu des moments difficiles... 🌀 Mais il n'a jamais abandonné !",
            "Ça va aller ! 🌸 L'anime nous apprend que les nakamas sont là dans les moments durs !",
        ],
    },
    {
        test: /\b(quel anime|recommande|suggestion|regarder)\b/,
        responses: [
            "Je te recommande Fullmetal Alchemist Brotherhood ! 🔥 Un chef-d'œuvre absolu.",
            "Essaie Vinland Saga si tu aimes les histoires épiques ! ⚔️",
            "Steins;Gate pour une histoire de voyage dans le temps incroyable ! ⏰",
            "Violet Evergarden pour pleurer toutes les larmes de ton corps ! 💜",
        ],
    },
]

// ─── Main Message Handler ──────────────────────────────────────────────────────

/**
 * Main handler for incoming messages.
 * Handles: !learn, mentions, direct messages, and group conversations.
 * @param {object} sock  - Baileys socket
 * @param {object} msg   - Incoming message object
 */
async function handleAIMessage(sock, msg) {
    if (!config.aiConfig?.enabled) return

    const jid = msg.key.remoteJid
    const isGroup = jid.endsWith('@g.us')
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
    if (!text) return

    const senderJid = msg.key.participant || msg.key.remoteJid
    const botJid = sock.user?.id?.replace(/:.*@/, '@') || ''

    // ── !learn <question> | <answer> ──────────────────────────────────────────
    if (text.toLowerCase().startsWith('!learn ')) {
        if (!config.aiConfig?.learningEnabled) {
            await sock.sendMessage(jid, { text: "❌ L'apprentissage est désactivé pour le moment." })
            return
        }
        const parts = text.slice(7).split('|')
        if (parts.length < 2) {
            await sock.sendMessage(jid, {
                text: "📚 Format: !learn <question> | <réponse>\nExemple: !learn Qui est Goku | C'est le héros de Dragon Ball ! 🐉",
            })
            return
        }
        const question = parts[0].trim()
        const answer = parts.slice(1).join('|').trim()
        try {
            await learnResponse(question, answer)
            await sock.sendMessage(jid, {
                text: `✅ Appris ! Je me souviendrai que "${question}" → "${answer}" 🧠✨`,
            })
        } catch (e) {
            console.error('Erreur learnResponse:', e)
            await sock.sendMessage(jid, { text: "❌ Erreur lors de l'apprentissage. Réessaie !" })
        }
        return
    }

    // ── Determine if bot should respond ───────────────────────────────────────
    const mentionedJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    const isMentioned = mentionedJids.some((jid) => jid.replace(/:.*@/, '@') === botJid)
    const isDM = !isGroup
    const startsWithIris = /^iris[,\s!]/i.test(text)

    // In groups: only respond when mentioned or addressed by name
    // In DMs: always respond
    if (isGroup && !isMentioned && !startsWithIris) return

    // Strip the mention/name prefix before processing
    let cleanText = text
        .replace(/@\d+/g, '')
        .replace(/^iris[,\s!]+/i, '')
        .trim()

    if (!cleanText) {
        await sock.sendMessage(jid, {
            text: "Hai ! 🌸 Tu m'as appelée ? Dis-moi ce que tu veux !",
            mentions: [senderJid],
        })
        return
    }

    try {
        const response = await getResponse(cleanText)
        await sock.sendMessage(jid, {
            text: response,
            mentions: isGroup ? [senderJid] : [],
        })
    } catch (e) {
        console.error('Erreur getResponse:', e)
    }
}

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = { learnResponse, getResponse, handleAIMessage, db }
