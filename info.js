module.exports = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { 
        text: '📖 Infos:\nIris est un bot otaku créé pour gérer la communauté.\nTape "rule" pour voir les commandes disponibles.'
    })
}
