const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const menu = require('./commands/menu')
const rules = require('./commands/rules')
const info = require('./commands/info')
const compatibility = require('./commands/compatibility')
const truthOrDare = require('./commands/truth_or_dare')
const opening = require('./commands/opening')
const news = require('./commands/news')
const quiz = require('./commands/quiz')
if (text.toLowerCase() === '!quiz') await quiz.startQuiz(sock, msg)
else if (text.toLowerCase().startsWith('!rep')) {
  const answer = text.replace('!rep', '').trim()
  await quiz.checkAnswer(sock, msg, answer)
}
else if (text.toLowerCase() === '!ranking') await quiz.showRanking(sock, msg)


// Dans messages.upsert :

else if (text.toLowerCase().startsWith('!rep')) {
    const answer = text.replace('!rep', '').trim()
    await quiz.checkAnswer(sock, msg, answer)
}
else if (text.toLowerCase() === '!ranking') await quiz.showRanking(sock, msg)


// Dans messages.upsert :
if (text.toLowerCase() === '!quiz') await quiz(sock, msg)
else if (text.toLowerCase() === '!compat') await compatibility(sock, msg)
else if (text.toLowerCase() === '!action') await truthOrDare(sock, msg)
else if (text.toLowerCase() === '!opening') await opening(sock, msg)
else if (text.toLowerCase() === '!news') await news(sock, msg)
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({ auth: state })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return
const config = require('./config')

// Exemple d’utilisation
await sock.sendMessage(msg.key.remoteJid, { text: config.welcomeMessage })
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text
        if (text) {
            console.log('Message reçu:', text)

            if (text.toLowerCase() === 'menu') {
                await menu(sock, msg)
            } else if (text.toLowerCase() === 'règles') {
                await rules(sock, msg)
            } else if (text.toLowerCase() === 'info') {
                await info(sock, msg)
            } else if (text.toLowerCase() === 'iris') {
                await sock.sendMessage(msg.key.remoteJid, { text: '🌸 Kon’nichiwa, je suis Iris, ton bot otaku !' })
            }
        }
    })
}

startBot()
