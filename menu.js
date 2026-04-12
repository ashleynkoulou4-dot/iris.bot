module.exports = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { 
        text: '⚔️ Règles du clan:\n- Respect entre nakama\n- Pas de spam\n- Partage d’animes et mangas bienvenus ✨'
    })
}
