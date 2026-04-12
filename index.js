const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const menu = require('./commands/menu')
const rules = require('./commands/rules')
const info = require('./commands/info')

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
