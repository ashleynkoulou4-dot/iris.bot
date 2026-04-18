/**
 * src/commands/games.js
 * Scheduled otaku-themed games for Iris Bot
 * Games: Anime Quiz, Waifu Guess, Manga Trivia, Shipping Game
 * Schedule: Every day at 20:00
 */

const cron = require('node-cron')
const { db } = require('./ai')

// ─── Game Data ─────────────────────────────────────────────────────────────────

const ANIME_QUIZ_QUESTIONS = [
    {
        question: "Dans quel anime le personnage principal crie-t-il 'Dattebayo !' ? 🌀",
        choices: ['A) Dragon Ball', 'B) Naruto', 'C) Bleach', 'D) One Piece'],
        answer: 'B',
        explanation: 'Naruto Uzumaki dit "Dattebayo !" (Crois-moi !) dans Naruto ! 🍃',
    },
    {
        question: "Quel est le fruit du démon de Monkey D. Luffy ? ☠️",
        choices: ['A) Mera Mera no Mi', 'B) Gura Gura no Mi', 'C) Gomu Gomu no Mi', 'D) Hana Hana no Mi'],
        answer: 'C',
        explanation: 'Le Gomu Gomu no Mi transforme Luffy en homme caoutchouc ! 🥊',
    },
    {
        question: "Comment s'appelle l'organisation des chasseurs de démons dans Demon Slayer ? 🔥",
        choices: ['A) Akatsuki', 'B) Corps des Tueurs de Démons', 'C) Société des Ombres', 'D) Guilde des Chasseurs'],
        answer: 'B',
        explanation: 'Le Corps des Tueurs de Démons (Kisatsutai) protège l\'humanité ! 🎋',
    },
    {
        question: "Quel est le vrai nom de Light Yagami dans Death Note ? 📓",
        choices: ['A) Kira', 'B) L', 'C) Light Yagami', 'D) Near'],
        answer: 'C',
        explanation: 'Light Yagami est son vrai nom, "Kira" est son pseudonyme de justicier ! ✒️',
    },
    {
        question: "Dans Attack on Titan, quel est le grade de Levi Ackerman ? ⚔️",
        choices: ['A) Commandant', 'B) Capitaine', 'C) Général', 'D) Sergent'],
        answer: 'B',
        explanation: 'Levi est le Capitaine de la Section Spéciale du Bataillon d\'Exploration ! 💪',
    },
    {
        question: "Quel studio a produit Spirited Away (Le Voyage de Chihiro) ? 🏮",
        choices: ['A) Toei Animation', 'B) Madhouse', 'C) Studio Ghibli', 'D) Bones'],
        answer: 'C',
        explanation: 'Studio Ghibli, fondé par Hayao Miyazaki, a créé ce chef-d\'œuvre ! 🌿',
    },
    {
        question: "Combien de membres compte l'Akatsuki dans Naruto Shippuden ? 🔴",
        choices: ['A) 7', 'B) 9', 'C) 10', 'D) 12'],
        answer: 'C',
        explanation: 'L\'Akatsuki compte 10 membres principaux, dont Pain et Konan ! 🌧️',
    },
    {
        question: "Quel est le pouvoir de Gojo Satoru dans Jujutsu Kaisen ? 😎",
        choices: ['A) Transmutation', 'B) Infinity (Mugen)', 'C) Télékinésie', 'D) Contrôle du temps'],
        answer: 'B',
        explanation: 'L\'Infinity de Gojo crée une barrière infinie qui arrête tout ! ♾️',
    },
    {
        question: "Dans quel anime trouve-t-on la ville de Amestris ? ⚗️",
        choices: ['A) Fairy Tail', 'B) Black Clover', 'C) Fullmetal Alchemist', 'D) Blue Exorcist'],
        answer: 'C',
        explanation: 'Amestris est le pays d\'Edward et Alphonse Elric dans FMA ! 🔩',
    },
    {
        question: "Quel personnage dit 'Ore wa Ochinchin ga daisuki nandayo' dans Konosuba ? 💦",
        choices: ['A) Kazuma', 'B) Aqua', 'C) Darkness', 'D) Megumin'],
        answer: 'D',
        explanation: 'Megumin est obsédée par les explosions dans KonoSuba ! 💥',
    },
]

const WAIFU_CHARACTERS = [
    {
        clues: [
            "Je suis une déesse de l'eau, mais je pleure souvent... 💧",
            "Je suis blonde avec des nattes et j'adore me vanter.",
            "Je fais partie d'un groupe d'aventuriers très dysfonctionnel.",
            "Mon nom commence par 'A' et je suis souvent inutile selon certains... 😤",
        ],
        answer: 'Aqua',
        anime: 'KonoSuba',
    },
    {
        clues: [
            "Je suis une démone avec des cornes et des cheveux roses. 🌸",
            "Je ne connais que quelques mots au début de mon histoire.",
            "Mon frère/ami me protège de tout. 🎋",
            "Je me transforme en quelque chose de redoutable la nuit.",
        ],
        answer: 'Nezuko',
        anime: 'Demon Slayer',
    },
    {
        clues: [
            "Je suis une guerrière aux cheveux noirs qui protège celui qu'elle aime. ⚔️",
            "Je suis considérée comme la plus forte de ma classe.",
            "Mon nom de famille est aussi celui d'une famille légendaire.",
            "Je suis dans un monde où des titans menacent l'humanité.",
        ],
        answer: 'Mikasa',
        anime: 'Attack on Titan',
    },
    {
        clues: [
            "Je suis une mage spécialisée dans UN seul sort. 💥",
            "Je porte un chapeau de sorcière et un manteau rouge.",
            "Je crie 'EXPLOSION !' avec une passion dévorante.",
            "Je fais partie d'un groupe d'aventuriers dans un monde de fantasy.",
        ],
        answer: 'Megumin',
        anime: 'KonoSuba',
    },
    {
        clues: [
            "Je suis une navigatrice experte et j'adore l'argent. 🗺️",
            "Mes cheveux sont orange et j'ai un tatouage sur le bras.",
            "Je fais partie du Chapeau de Paille.",
            "Mon rêve est de cartographier tous les océans du monde.",
        ],
        answer: 'Nami',
        anime: 'One Piece',
    },
]

const MANGA_TRIVIA = [
    {
        fact: "Le manga One Piece, créé par Eiichiro Oda, est le manga le plus vendu de l'histoire avec plus de 500 millions d'exemplaires ! ☠️📚",
        question: "Combien d'exemplaires One Piece a-t-il vendus approximativement ?",
        answer: '500 millions',
    },
    {
        fact: "Dragon Ball a été publié pour la première fois en 1984 dans le Weekly Shōnen Jump ! 🐉",
        question: "En quelle année Dragon Ball a-t-il été publié pour la première fois ?",
        answer: '1984',
    },
    {
        fact: "Fullmetal Alchemist Brotherhood est souvent classé #1 sur MyAnimeList avec une note proche de 9.1/10 ! ⚗️",
        question: "Quel anime est souvent classé #1 sur MyAnimeList ?",
        answer: 'Fullmetal Alchemist Brotherhood',
    },
    {
        fact: "Le mot 'manga' (漫画) signifie littéralement 'images dérisoires' ou 'images au fil de l'eau' en japonais ! 🎌",
        question: "Que signifie littéralement le mot 'manga' en japonais ?",
        answer: 'images dérisoires / images au fil de l\'eau',
    },
    {
        fact: "Osamu Tezuka, créateur d'Astro Boy, est surnommé 'le Dieu du Manga' ! 🤖",
        question: "Qui est surnommé 'le Dieu du Manga' ?",
        answer: 'Osamu Tezuka',
    },
    {
        fact: "Naruto a été publié pendant 15 ans (1999-2014) dans le Weekly Shōnen Jump ! 🌀",
        question: "Combien d'années Naruto a-t-il été publié dans le Weekly Shōnen Jump ?",
        answer: '15 ans',
    },
]

const SHIPPING_PAIRS = [
    {
        pair: ['Naruto 🌀', 'Hinata 💜'],
        context: 'Naruto x Hinata (NaruHina) – L\'amour patient de Hinata a finalement été récompensé ! 💕',
    },
    {
        pair: ['Luffy ☠️', 'Nami 🗺️'],
        context: 'Luffy x Nami (LuNa) – Le capitaine et la navigatrice, une équipe parfaite ! ⚓',
    },
    {
        pair: ['Eren ⚔️', 'Mikasa 🧣'],
        context: 'Eren x Mikasa (ErenMika) – Un amour tragique dans un monde cruel... 💔',
    },
    {
        pair: ['Gojo 😎', 'Geto 🌿'],
        context: 'Gojo x Geto (GojoGeto) – La bromance la plus intense de Jujutsu Kaisen ! ✨',
    },
    {
        pair: ['Edward ⚗️', 'Winry 🔧'],
        context: 'Edward x Winry (EdWin) – L\'alchimiste et la mécanicienne, faits l\'un pour l\'autre ! 💛',
    },
    {
        pair: ['Tanjiro 🎋', 'Kanao 🦋'],
        context: 'Tanjiro x Kanao (TanKana) – Une histoire d\'espoir et de guérison ! 🌸',
    },
]

// ─── Score Tracking ────────────────────────────────────────────────────────────

// In-memory session scores (reset each game)
const sessionScores = new Map()

function addScore(userId, username, gameType, points) {
    const key = `${userId}:${gameType}`
    const current = sessionScores.get(key) || { userId, username, gameType, score: 0 }
    current.score += points
    sessionScores.set(key, current)

    // Persist to DB
    db.run(
        `INSERT INTO game_scores (userId, username, gameType, score) VALUES (?, ?, ?, ?)`,
        [userId, username || 'Anonyme', gameType, points],
        (err) => { if (err) console.error('Erreur addScore:', err) }
    )
}

async function getLeaderboard(gameType = null) {
    return new Promise((resolve, reject) => {
        const query = gameType
            ? `SELECT userId, username, gameType, SUM(score) as total
               FROM game_scores WHERE gameType = ?
               GROUP BY userId ORDER BY total DESC LIMIT 10`
            : `SELECT userId, username, SUM(score) as total
               FROM game_scores
               GROUP BY userId ORDER BY total DESC LIMIT 10`
        const params = gameType ? [gameType] : []
        db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    })
}

// ─── Game: Anime Quiz ──────────────────────────────────────────────────────────

/**
 * Run an anime quiz in the group.
 * Sends a question, waits 30s for answers, then reveals the result.
 * @param {object} sock
 * @param {string} groupJid
 */
async function playAnimeQuiz(sock, groupJid) {
    const q = ANIME_QUIZ_QUESTIONS[Math.floor(Math.random() * ANIME_QUIZ_QUESTIONS.length)]
    const choicesText = q.choices.join('\n')

    await sock.sendMessage(groupJid, {
        text:
            `🎮 *ANIME QUIZ TIME !* 🎮\n\n` +
            `❓ ${q.question}\n\n` +
            `${choicesText}\n\n` +
            `⏱️ Vous avez *30 secondes* pour répondre !\n` +
            `📩 Répondez avec la lettre : A, B, C ou D`,
    })

    // Collect answers for 30 seconds
    const answers = new Map()
    const listener = ({ messages }) => {
        const m = messages[0]
        if (!m?.message || m.key.remoteJid !== groupJid) return
        const t = (m.message.conversation || m.message.extendedTextMessage?.text || '').trim().toUpperCase()
        if (['A', 'B', 'C', 'D'].includes(t)) {
            const sender = m.key.participant || m.key.remoteJid
            if (!answers.has(sender)) {
                answers.set(sender, { answer: t, pushName: m.pushName || 'Nakama' })
            }
        }
    }
    sock.ev.on('messages.upsert', listener)

    await new Promise((r) => setTimeout(r, 30_000))
    sock.ev.off('messages.upsert', listener)

    // Evaluate answers
    const winners = []
    const losers = []
    for (const [userId, data] of answers) {
        if (data.answer === q.answer) {
            winners.push(data.pushName)
            addScore(userId, data.pushName, 'animeQuiz', 10)
        } else {
            losers.push(`${data.pushName} (${data.answer})`)
        }
    }

    let result = `⏰ *Temps écoulé !*\n\n`
    result += `✅ Bonne réponse : *${q.answer}*\n`
    result += `📖 ${q.explanation}\n\n`

    if (winners.length > 0) {
        result += `🏆 *Gagnants (+10 pts) :* ${winners.join(', ')}\n`
    } else {
        result += `😅 Personne n'a trouvé la bonne réponse cette fois !\n`
    }
    if (losers.length > 0) {
        result += `❌ *Mauvaise réponse :* ${losers.join(', ')}\n`
    }
    if (answers.size === 0) {
        result += `😴 Personne n'a répondu... Dormez-vous ? 💤`
    }

    await sock.sendMessage(groupJid, { text: result })
}

// ─── Game: Waifu Guess ─────────────────────────────────────────────────────────

/**
 * Run a "Guess the Waifu/Character" game.
 * Reveals clues one by one, members guess the character.
 * @param {object} sock
 * @param {string} groupJid
 */
async function playWaifuGuess(sock, groupJid) {
    const character = WAIFU_CHARACTERS[Math.floor(Math.random() * WAIFU_CHARACTERS.length)]
    let solved = false
    let winner = null

    await sock.sendMessage(groupJid, {
        text:
            `💕 *WAIFU/CHARACTER GUESS !* 💕\n\n` +
            `🔍 Devinez le personnage d'anime !\n` +
            `Je vais donner des indices un par un...\n\n` +
            `📩 Répondez avec le nom du personnage !`,
    })

    const listener = ({ messages }) => {
        if (solved) return
        const m = messages[0]
        if (!m?.message || m.key.remoteJid !== groupJid) return
        const t = (m.message.conversation || m.message.extendedTextMessage?.text || '').trim().toLowerCase()
        if (t.includes(character.answer.toLowerCase())) {
            solved = true
            winner = { jid: m.key.participant || m.key.remoteJid, name: m.pushName || 'Nakama' }
        }
    }
    sock.ev.on('messages.upsert', listener)

    // Reveal clues with 20s intervals
    for (let i = 0; i < character.clues.length; i++) {
        if (solved) break
        await sock.sendMessage(groupJid, {
            text: `💡 *Indice ${i + 1}/${character.clues.length} :*\n${character.clues[i]}`,
        })
        await new Promise((r) => setTimeout(r, 20_000))
    }

    sock.ev.off('messages.upsert', listener)

    if (solved && winner) {
        addScore(winner.jid, winner.name, 'waifuGuess', 15)
        await sock.sendMessage(groupJid, {
            text:
                `🎉 *BRAVO ${winner.name} !* 🎉\n\n` +
                `✅ C'était bien *${character.answer}* de *${character.anime}* !\n` +
                `🏆 +15 points pour toi !`,
        })
    } else {
        await sock.sendMessage(groupJid, {
            text:
                `😅 *Personne n'a trouvé !*\n\n` +
                `✅ C'était *${character.answer}* de *${character.anime}* !\n` +
                `Meilleure chance la prochaine fois, nakamas ! 🌸`,
        })
    }
}

// ─── Game: Manga Trivia ────────────────────────────────────────────────────────

/**
 * Share a manga trivia fact and ask a quick question.
 * @param {object} sock
 * @param {string} groupJid
 */
async function playMangaTrivia(sock, groupJid) {
    const trivia = MANGA_TRIVIA[Math.floor(Math.random() * MANGA_TRIVIA.length)]

    await sock.sendMessage(groupJid, {
        text:
            `📚 *MANGA TRIVIA !* 📚\n\n` +
            `❓ *Question :* ${trivia.question}\n\n` +
            `⏱️ Vous avez *20 secondes* pour répondre !`,
    })

    const answers = new Map()
    const listener = ({ messages }) => {
        const m = messages[0]
        if (!m?.message || m.key.remoteJid !== groupJid) return
        const t = (m.message.conversation || m.message.extendedTextMessage?.text || '').trim()
        if (t.length > 0 && !t.startsWith('!')) {
            const sender = m.key.participant || m.key.remoteJid
            if (!answers.has(sender)) {
                answers.set(sender, { text: t, pushName: m.pushName || 'Nakama' })
            }
        }
    }
    sock.ev.on('messages.upsert', listener)
    await new Promise((r) => setTimeout(r, 20_000))
    sock.ev.off('messages.upsert', listener)

    // Check for correct answers (loose match)
    const correctAnswer = trivia.answer.toLowerCase()
    const winners = []
    for (const [userId, data] of answers) {
        if (data.text.toLowerCase().includes(correctAnswer) ||
            correctAnswer.includes(data.text.toLowerCase())) {
            winners.push(data.pushName)
            addScore(userId, data.pushName, 'mangaTrivia', 8)
        }
    }

    let result = `⏰ *Temps écoulé !*\n\n`
    result += `💡 *Le saviez-vous ?*\n${trivia.fact}\n\n`
    result += `✅ *Réponse attendue :* ${trivia.answer}\n\n`

    if (winners.length > 0) {
        result += `🏆 *Bien joué (+8 pts) :* ${winners.join(', ')} !`
    } else {
        result += `😅 Personne n'a trouvé exactement, mais maintenant vous savez ! 📖`
    }

    await sock.sendMessage(groupJid, { text: result })
}

// ─── Game: Shipping Game ───────────────────────────────────────────────────────

/**
 * Run a shipping vote: members vote for or against a pairing.
 * @param {object} sock
 * @param {string} groupJid
 */
async function playShippingGame(sock, groupJid) {
    const ship = SHIPPING_PAIRS[Math.floor(Math.random() * SHIPPING_PAIRS.length)]
    const [char1, char2] = ship.pair

    await sock.sendMessage(groupJid, {
        text:
            `💘 *SHIPPING GAME !* 💘\n\n` +
            `${ship.context}\n\n` +
            `*${char1}* ❤️ *${char2}*\n\n` +
            `Votez maintenant !\n` +
            `💚 Tapez *OUI* si vous shippez !\n` +
            `❌ Tapez *NON* si vous ne shippez pas !\n\n` +
            `⏱️ Vote ouvert pendant *45 secondes* !`,
    })

    const votes = { oui: [], non: [] }
    const voted = new Set()

    const listener = ({ messages }) => {
        const m = messages[0]
        if (!m?.message || m.key.remoteJid !== groupJid) return
        const t = (m.message.conversation || m.message.extendedTextMessage?.text || '').trim().toLowerCase()
        const sender = m.key.participant || m.key.remoteJid
        if (voted.has(sender)) return
        if (t === 'oui' || t === 'yes' || t === '💚') {
            votes.oui.push(m.pushName || 'Nakama')
            voted.add(sender)
            addScore(sender, m.pushName || 'Nakama', 'shippingGame', 3)
        } else if (t === 'non' || t === 'no' || t === '❌') {
            votes.non.push(m.pushName || 'Nakama')
            voted.add(sender)
            addScore(sender, m.pushName || 'Nakama', 'shippingGame', 3)
        }
    }
    sock.ev.on('messages.upsert', listener)
    await new Promise((r) => setTimeout(r, 45_000))
    sock.ev.off('messages.upsert', listener)

    const total = votes.oui.length + votes.non.length
    const ouiPct = total > 0 ? Math.round((votes.oui.length / total) * 100) : 0
    const nonPct = total > 0 ? 100 - ouiPct : 0

    let result = `📊 *Résultats du vote !*\n\n`
    result += `*${char1}* ❤️ *${char2}*\n\n`
    result += `💚 OUI : ${votes.oui.length} votes (${ouiPct}%)\n`
    result += `❌ NON : ${votes.non.length} votes (${nonPct}%)\n\n`

    if (total === 0) {
        result += `😴 Personne n'a voté... Le ship reste mystérieux ! 🌙`
    } else if (ouiPct > 50) {
        result += `💕 La communauté *SHIP* ce couple ! ${char1} ❤️ ${char2} forever !`
    } else if (nonPct > 50) {
        result += `💔 La communauté ne ship *PAS* ce couple... Chacun ses goûts !`
    } else {
        result += `⚖️ C'est un vote *parfaitement équilibré* ! La communauté est divisée !`
    }

    await sock.sendMessage(groupJid, { text: result })
}

// ─── Leaderboard Command ───────────────────────────────────────────────────────

/**
 * Send the global leaderboard to the group.
 * @param {object} sock
 * @param {string} jid
 */
async function showLeaderboard(sock, jid) {
    try {
        const rows = await getLeaderboard()
        if (!rows || rows.length === 0) {
            await sock.sendMessage(jid, {
                text: '🏆 Aucun score enregistré pour le moment. Participez aux jeux du soir à 20h ! 🎮',
            })
            return
        }
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        let text = `🏆 *CLASSEMENT GÉNÉRAL* 🏆\n\n`
        rows.forEach((row, i) => {
            text += `${medals[i] || `${i + 1}.`} *${row.username || 'Nakama'}* — ${row.total} pts\n`
        })
        text += `\n🎮 Jouez chaque soir à 20h pour grimper dans le classement !`
        await sock.sendMessage(jid, { text })
    } catch (e) {
        console.error('Erreur showLeaderboard:', e)
    }
}

// ─── Daily Game Scheduler ──────────────────────────────────────────────────────

// Track which game to play next (round-robin)
let gameIndex = 0
const GAME_ROTATION = ['animeQuiz', 'waifuGuess', 'mangaTrivia', 'shippingGame']

/**
 * Initialize the daily cron job for scheduled games.
 * Runs every day at 20:00 and rotates through all game types.
 * @param {object} sock
 * @param {string} groupJid
 */
function startDailyGames(sock, groupJid) {
    console.log(`🕗 Jeux quotidiens programmés à 20:00 pour le groupe ${groupJid}`)

    // Every day at 20:00
    cron.schedule('0 20 * * *', async () => {
        const gameType = GAME_ROTATION[gameIndex % GAME_ROTATION.length]
        gameIndex++

        console.log(`🎮 Démarrage du jeu du soir : ${gameType}`)

        try {
            // Announce the evening game session
            await sock.sendMessage(groupJid, {
                text:
                    `🌙 *BONSOIR NAKAMAS !* 🌙\n\n` +
                    `C'est l'heure des jeux du soir ! 🎮✨\n` +
                    `Préparez-vous, le jeu commence dans *10 secondes* !\n\n` +
                    `🎌 Que le meilleur otaku gagne !`,
            })

            await new Promise((r) => setTimeout(r, 10_000))

            switch (gameType) {
                case 'animeQuiz':
                    await playAnimeQuiz(sock, groupJid)
                    break
                case 'waifuGuess':
                    await playWaifuGuess(sock, groupJid)
                    break
                case 'mangaTrivia':
                    await playMangaTrivia(sock, groupJid)
                    break
                case 'shippingGame':
                    await playShippingGame(sock, groupJid)
                    break
            }

            // Post-game message
            await sock.sendMessage(groupJid, {
                text:
                    `🌸 *Jeu terminé !* Merci d'avoir participé !\n` +
                    `📊 Tapez *!leaderboard* pour voir le classement général.\n` +
                    `🎮 Prochain jeu demain à 20h ! Oyasumi~ 🌙`,
            })
        } catch (e) {
            console.error('Erreur jeu du soir:', e)
        }
    }, {
        timezone: 'Europe/Paris',
    })
}

// ─── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
    startDailyGames,
    playAnimeQuiz,
    playWaifuGuess,
    playMangaTrivia,
    playShippingGame,
    showLeaderboard,
}
