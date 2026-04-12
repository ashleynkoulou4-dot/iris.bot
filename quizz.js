let scores = {}

async function startQuiz(sock, msg) {
  const questions = [
    { q: "Quel est le vrai nom du Quatrième Hokage ?", a: "Minato Namikaze" },
    { q: "Qui a créé l’Akatsuki ?", a: "Yahiko" },
    { q: "Quel est le démon scellé dans Gaara ?", a: "Shukaku" },
    { q: "Qui a tué Jiraiya ?", a: "Pain" },
    { q: "Quel est le Kekkei Genkai du clan Uchiha ?", a: "Sharingan" },
    // ... ajoute toutes tes autres questions
  ]

  const random = questions[Math.floor(Math.random() * questions.length)]
  const sender = msg.key.participant || msg.key.remoteJid

  await sock.sendMessage(msg.key.remoteJid, { 
    text: `❓ Quiz difficile: ${random.q}\n💡 Réponds avec: !rep <ta réponse>` 
  })

  if (!scores[sender]) scores[sender] = { points: 0, pending: null }
  scores[sender].pending = random
}

async function checkAnswer(sock, msg, text) {
  const sender = msg.key.participant || msg.key.remoteJid
  if (!scores[sender] || !scores[sender].pending) return

  const question = scores[sender].pending
  if (text.toLowerCase() === question.a.toLowerCase()) {
    scores[sender].points += 10
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `✅ Correct ! Tu gagnes 10 points. Score actuel: ${scores[sender].points}` 
    })
  } else {
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `❌ Mauvaise réponse. La bonne était: ${question.a}` 
    })
  }

  scores[sender].pending = null
}

async function showRanking(sock, msg) {
  const ranking = Object.entries(scores)
    .sort((a, b) => b[1].points - a[1].points)
    .map(([player, data], i) => `${i+1}. ${player.split('@')[0]} - ${data.points} pts`)
    .join("\n")

  await sock.sendMessage(msg.key.remoteJid, { text: `🏆 Classement Otaku:\n${ranking}` })
}

// Export principal + méthodes
module.exports = startQuiz
module.exports.checkAnswer = checkAnswer
module.exports.showRanking = showRanking
     
      
     
