const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const menu = require('./commands/menu')
const rules = require('./commands/rules')
const info = require('./commands/info')
const quiz = require('./commands/quiz')
const compatibility = require('./commands/compatibility')
const truthOrDare = require('./commands/truth_or_dare')
const opening = require('./commands/opening')
const news = require('./commands/news')
const { handleLinkBan, handleLinkCommands } = require('./commands/linkban')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({ auth: state })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text
        if (text) {
            console.log('Message reçu:', text)

            // --- Link-ban admin commands (!addlink, !removelink, !linkwhitelist) ---
            const handledByLinkCmd = await handleLinkCommands(sock, msg)
            if (!handledByLinkCmd) {
                // --- Passive link detection: scan every message for unauthorized links ---
                await handleLinkBan(sock, msg)

                if (text.toLowerCase() === 'menu') {
                    await menu(sock, msg)
                } else if (text.toLowerCase() === 'règles') {
                    await rules(sock, msg)
                } else if (text.toLowerCase() === 'info') {
                    await info(sock, msg)
                } else if (text.toLowerCase() === 'iris') {
                    await sock.sendMessage(msg.key.remoteJid, { text: '\uD83C\uDF38 Kon\u2019nichiwa, je suis Iris, ton bot otaku !' })
                } else if (text.toLowerCase() === '!quiz') {
                    await quiz(sock, msg)
                } else if (text.toLowerCase() === '!compat') {
                    await compatibility(sock, msg)
                } else if (text.toLowerCase() === '!action') {
                    await truthOrDare(sock, msg)
                } else if (text.toLowerCase() === '!opening') {
                    await opening(sock, msg)
                } else if (text.toLowerCase() === '!news') {
                    await news(sock, msg)
                } else if (text.toLowerCase().startsWith('!rep')) {
                    const answer = text.replace('!rep', '').trim()
                    await quiz.checkAnswer(sock, msg, answer)
                } else if (text.toLowerCase() === '!ranking') {
                    await quiz.showRanking(sock, msg)
                }
            }
        }
    })
}

startBot()
