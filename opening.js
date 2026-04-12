module.exports = async (sock, msg) => {
    const openings = [
        "🎶 Naruto Shippuden – Blue Bird",
        "🎶 One Piece – We Are!",
        "🎶 Demon Slayer – Gurenge"
    ]
    const random = openings[Math.floor(Math.random() * openings.length)]
    await sock.sendMessage(msg.key.remoteJid, { text: `🎵 Opening recommandé: ${random}` })
}
