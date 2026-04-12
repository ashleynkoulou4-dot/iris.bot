module.exports = async (sock, msg) => {
    const news = [
        "📢 Nouvel arc annoncé pour Jujutsu Kaisen !",
        "📢 One Piece atteint 1100 chapitres 🎉",
        "📢 Demon Slayer saison finale confirmée 🔥"
    ]
    const random = news[Math.floor(Math.random() * news.length)]
    await sock.sendMessage(msg.key.remoteJid, { text: `📰 Actu Otaku: ${random}` })
}
