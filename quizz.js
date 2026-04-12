// Système de quiz avec 200 questions difficiles
let scores = {}

module.exports = async (sock, msg) => {
    const questions = [
        // --- Naruto (40) ---
        { q: "Quel est le vrai nom du Quatrième Hokage ?", a: "Minato Namikaze" },
        { q: "Qui a créé l’Akatsuki ?", a: "Yahiko" },
        { q: "Quel est le démon scellé dans Gaara ?", a: "Shukaku" },
        { q: "Qui a tué Jiraiya ?", a: "Pain" },
        { q: "Quel est le Kekkei Genkai du clan Uchiha ?", a: "Sharingan" },
        { q: "Quel est le nom du père de Naruto ?", a: "Minato Namikaze" },
        { q: "Quel est le nom du frère de Itachi ?", a: "Sasuke" },
        { q: "Qui est le jinchuriki de Kurama ?", a: "Naruto Uzumaki" },
        { q: "Quel est le nom du clan de Neji ?", a: "Hyuga" },
        { q: "Quel est le nom du démon à neuf queues ?", a: "Kurama" },
        // ... ajoute jusqu’à 40 questions Naruto

        // --- One Piece (40) ---
        { q: "Quel fruit du démon possède Trafalgar Law ?", a: "Ope Ope no Mi" },
        { q: "Qui est le père de Ace ?", a: "Gol D. Roger" },
        { q: "Quel est le navire des Mugiwara ?", a: "Thousand Sunny" },
        { q: "Quel est le vrai nom de Kaido ?", a: "Kaido des Cent Bêtes" },
        { q: "Quel est le rêve de Luffy ?", a: "Devenir le Roi des Pirates" },
        { q: "Qui est le cuisinier de l’équipage ?", a: "Sanji" },
        { q: "Quel est le fruit du démon de Brook ?", a: "Yomi Yomi no Mi" },
        { q: "Qui est le premier membre à rejoindre Luffy ?", a: "Zoro" },
        { q: "Quel est le nom du fruit de Nico Robin ?", a: "Hana Hana no Mi" },
        { q: "Qui est le père de Franky ?", a: "Inconnu" },
        // ... ajoute jusqu’à 40 questions One Piece

        // --- Bleach (30) ---
        { q: "Quel est le bankai de Byakuya Kuchiki ?", a: "Senbonzakura Kageyoshi" },
        { q: "Quel est le zanpakutō d’Ichigo ?", a: "Zangetsu" },
        { q: "Qui est le capitaine de la 12e division ?", a: "Mayuri Kurotsuchi" },
        { q: "Quel est le bankai de Tōshirō Hitsugaya ?", a: "Daiguren Hyōrinmaru" },
        { q: "Qui est le chef des Arrancars ?", a: "Aizen" },
        // ... ajoute jusqu’à 30 questions Bleach

        // --- Demon Slayer (30) ---
        { q: "Quel souffle utilise Rengoku ?", a: "Souffle de la Flamme" },
        { q: "Quel est le nom de la sœur de Tanjiro ?", a: "Nezuko" },
        { q: "Qui est le démon responsable de la mort de la famille Kamado ?", a: "Muzan Kibutsuji" },
        { q: "Quel est le souffle de Giyu Tomioka ?", a: "Souffle de l’Eau" },
        { q: "Quel est le rang de Zenitsu ?", a: "Pourfendeur de démons" },
        // ... ajoute jusqu’à 30 questions Demon Slayer

        // --- Attack on Titan (30) ---
        { q: "Qui est le détenteur originel du Titan Assaillant ?", a: "Eren Kruger" },
        { q: "Quel est le vrai nom du Titan Colossal ?", a: "Bertolt Hoover" },
        { q: "Qui a fondé les Murs ?", a: "Karl Fritz" },
        { q: "Quel est le Titan de Reiner Braun ?", a: "Titan Cuirassé" },
        { q: "Qui est le chef du Bataillon d’exploration ?", a: "Erwin Smith" },
        // ... ajoute jusqu’à 30 questions AOT

        // --- Autres (Death Note, Hunter x Hunter, Fairy Tail, FMA, etc.) (30) ---
        { q: "Quel est le vrai nom de L dans Death Note ?", a: "L Lawliet" },
        { q: "Quel est le père de Gon ?", a: "Ging Freecss" },
        { q: "Qui est le premier maître de Fairy Tail ?", a: "Mavis Vermillion" },
        { q: "Quel est le principe interdit de l’alchimie dans Fullmetal Alchemist ?", a: "La transmutation humaine" },
        { q: "Quel est le Nen de Killua ?", a: "Transformation" },
        // ... ajoute jusqu’à 30 questions autres mangas
    ]

    const random = questions[Math.floor(Math.random() * questions.length)]
    const sender = msg.key.participant || msg.key.remoteJid

    await sock.sendMessage(msg.key.remoteJid, { text: `❓ Quiz difficile: ${random.q}\n💡 Réponds avec: !rep <ta réponse>` })

    if (!scores[sender]) scores[sender] = { points: 0, pending: null }
    scores[sender].pending = random
}

// Vérification des réponses
module.exports.checkAnswer = async (sock, msg, text) => {
    const sender = msg.key.participant || msg.key.remoteJid
    if (!scores[sender] || !scores[sender].pending) return

    const question = scores[sender].pending
    if (text.toLowerCase() === question.a.toLowerCase()) {
        scores[sender].points += 10
        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Correct ! Tu gagnes 10 points. Score actuel: ${scores[sender].points}` })
    } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ Mauvaise réponse. La bonne était: ${question.a}` })
    }

    scores[sender].pending = null
}

// Classement
module.exports.showRanking = async (sock, msg) => {
    const ranking = Object.entries(scores)
        .sort((a, b) => b[1].points - a[1].points)
        .map(([player, data], i) => `${i+1}. ${player.split('@')[0]} - ${data.points} pts`)
        .join("\n")

    await sock.sendMessage(msg.key.remoteJid, { text: `🏆 Classement Otaku:\n${ranking}` })
}
