module.exports = async (sock, msg) => {
    const members = ["Naruto & Hinata", "Luffy & Nami", "Tanjiro & Nezuko"]
    const random = members[Math.floor(Math.random() * members.length)]
    await sock.sendMessage(msg.key.remoteJid, { text: `💞 Compatibilité prédite: ${random}` })
}
