module.exports = async (sock, msg) => {
    const questions = [
        { q: "Qui est le frère de Itachi ?", a: "Sasuke" },
        { q: "Quel est le rêve de Luffy ?", a: "Devenir le Roi des Pirates" }
    ]
    const random = questions[Math.floor(Math.random() * questions.length)]
    await sock.sendMessage(msg.key.remoteJid, { text: `❓ Quiz: ${random.q}` })
}
