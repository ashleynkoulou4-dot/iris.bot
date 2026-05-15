/**
 * src/commands/profile.js
 * User Profile & Economy System
 */

const { allAsync, getAsync, runAsync } = require('../db/database')

async function getOrCreateUser(jid, name) {
    let user = await getAsync('SELECT * FROM users WHERE jid = ?', [jid])
    if (!user) {
        await runAsync(
            'INSERT INTO users (jid, name) VALUES (?, ?)',
            [jid, name]
        )
        user = await getAsync('SELECT * FROM users WHERE jid = ?', [jid])
    }
    return user
}

async function showProfile(sock, jid, userJid) {
    try {
        const user = await getOrCreateUser(userJid, 'Unknown')
        const scores = await allAsync(
            'SELECT game_type, MAX(score) as best_score FROM game_scores WHERE user_jid = ? GROUP BY game_type',
            [userJid]
        )

        const expNeeded = user.level * 1000
        const expPercentage = Math.round((user.experience / expNeeded) * 100)

        let scoreText = scores.length > 0
            ? scores.map(s => `• ${s.game_type}: ${s.best_score} pts`).join('\n')
            : '• Aucun jeu joué'

        const profileText = `
╔════════════════════════════════╗
║     👤 PROFIL D'UTILISATEUR 👤  ║
╚════════════════════════════════╝

🏷️ *Nom:* ${user.name}
⭐ *Niveau:* ${user.level} (${expPercentage}%)
💰 *Balance:* ${user.balance} pièces
🎯 *Points Totaux:* ${user.points}
🎖️ *Rôle:* ${user.role}
⚠️ *Avertissements:* ${user.warnings}/3

📊 *Meilleurs Scores:*
${scoreText}

📅 *Membre depuis:* ${new Date(user.created_at).toLocaleDateString('fr-FR')}
        `
        await sock.sendMessage(jid, { text: profileText })
    } catch (err) {
        console.error('Error showing profile:', err)
        await sock.sendMessage(jid, { text: '❌ Erreur lors de la récupération du profil.' })
    }
}

async function showLeaderboard(sock, jid) {
    try {
        const topUsers = await allAsync(
            'SELECT name, points, level FROM users ORDER BY points DESC LIMIT 10'
        )

        let leaderboard = '🏆 *CLASSEMENT TOP 10* 🏆\n\n'
        topUsers.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}️⃣`
            leaderboard += `${medal} **${user.name}** - Lvl ${user.level} (${user.points} pts)\n`
        })

        await sock.sendMessage(jid, { text: leaderboard })
    } catch (err) {
        console.error('Error showing leaderboard:', err)
        await sock.sendMessage(jid, { text: '❌ Erreur lors de la récupération du classement.' })
    }
}

async function addPoints(userJid, points, gameType) {
    try {
        await runAsync(
            'UPDATE users SET points = points + ? WHERE jid = ?',
            [points, userJid]
        )
        
        if (gameType) {
            await runAsync(
                'INSERT INTO game_scores (user_jid, game_type, score) VALUES (?, ?, ?)',
                [userJid, gameType, points]
            )
        }

        // Level up check (every 500 points)
        const user = await getAsync('SELECT * FROM users WHERE jid = ?', [userJid])
        const newLevel = Math.floor(user.points / 500) + 1
        if (newLevel > user.level) {
            await runAsync(
                'UPDATE users SET level = ? WHERE jid = ?',
                [newLevel, userJid]
            )
            return { levelUp: true, newLevel }
        }
        return { levelUp: false }
    } catch (err) {
        console.error('Error adding points:', err)
    }
}

async function dailyBonus(sock, jid, userJid) {
    try {
        const today = new Date().toISOString().split('T')[0]
        const checkin = await getAsync(
            'SELECT * FROM daily_checkins WHERE user_jid = ? AND checkin_date = ?',
            [userJid, today]
        )

        if (checkin) {
            await sock.sendMessage(jid, { text: '❌ Tu as déjà reçu ton bonus du jour ! ⏰' })
            return
        }

        await runAsync(
            'INSERT INTO daily_checkins (user_jid, checkin_date) VALUES (?, ?)',
            [userJid, today]
        )

        await runAsync(
            'UPDATE users SET balance = balance + 100 WHERE jid = ?',
            [userJid]
        )

        await sock.sendMessage(jid, { text: '✅ +100 pièces reçues ! 💰' })
    } catch (err) {
        console.error('Error daily bonus:', err)
    }
}

module.exports = {
    getOrCreateUser,
    showProfile,
    showLeaderboard,
    addPoints,
    dailyBonus
}
