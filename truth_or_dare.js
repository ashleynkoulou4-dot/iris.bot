module.exports = async (sock, msg) => {
    const actions = ["Imite un cri d’anime 🎤", "Envoie ton opening préféré 🎶"]
    const truths = ["Ton anime préféré ?", "Ton personnage préféré ?"]
    const random = Math.random() > 0.5 ? actions : truths
    const choice = random[Math.floor(Math.random() * random.length)]
    await sock.sendMessage(msg.key.remoteJid, { text: `🎲 Action ou Vérité: ${choice}` })
}
