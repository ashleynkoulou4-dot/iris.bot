module.exports = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { 
        text: '🍙 Menu Iris:\n1️⃣ Règles\n2️⃣ Infos\n3️⃣ Contact admin\n4️⃣ Derniers animes recommandés 🎬'
    })
}
