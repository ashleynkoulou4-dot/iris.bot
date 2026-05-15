/**
 * src/commands/moderation.js
 * Moderation System - Warn, Mute, Ban, Roles
 */

const { getAsync, runAsync, allAsync } = require('../db/database')

async function warnUser(sock, jid, targetJid, reason, modJid) {
    try {
        const user = await getAsync('SELECT * FROM users WHERE jid = ?', [targetJid])
        if (!user) return false

        const newWarnings = user.warnings + 1

        await runAsync(
            'INSERT INTO moderation_logs (user_jid, action, reason, mod_jid) VALUES (?, ?, ?, ?)',
            [targetJid, 'WARN', reason, modJid]
        )

        await runAsync(
            'UPDATE users SET warnings = ? WHERE jid = ?',
            [newWarnings, targetJid]
        )

        const warnText = `⚠️ *AVERTISSEMENT* ⚠️\n\n${user.name} a reçu un avertissement.\n\n📋 *Raison:* ${reason}\n⚠️ *Total:* ${newWarnings}/3\n\n${newWarnings >= 3 ? '🚫 Prochain avertissement = BANISSEMENT' : ''}`
        
        await sock.sendMessage(jid, { text: warnText })
        return true
    } catch (err) {
        console.error('Error warning user:', err)
        return false
    }
}

async function muteUser(sock, jid, targetJid, duration, reason, modJid) {
    try {
        const muteUntil = Date.now() + duration

        await runAsync(
            'UPDATE users SET muted_until = ? WHERE jid = ?',
            [muteUntil, targetJid]
        )

        await runAsync(
            'INSERT INTO moderation_logs (user_jid, action, reason, mod_jid, duration) VALUES (?, ?, ?, ?, ?)',
            [targetJid, 'MUTE', reason, modJid, duration]
        )

        const durationMin = Math.round(duration / 60000)
        const muteText = `🔇 *UTILISATEUR EN SOURDINE* 🔇\n\n⏱️ *Durée:* ${durationMin} minutes\n📋 *Raison:* ${reason}`
        
        await sock.sendMessage(jid, { text: muteText })
        return true
    } catch (err) {
        console.error('Error muting user:', err)
        return false
    }
}

async function banUser(sock, jid, targetJid, reason, modJid) {
    try {
        await runAsync(
            'UPDATE users SET role = ? WHERE jid = ?',
            ['BANNED', targetJid]
        )

        await runAsync(
            'INSERT INTO moderation_logs (user_jid, action, reason, mod_jid) VALUES (?, ?, ?, ?)',
            [targetJid, 'BAN', reason, modJid]
        )

        const banText = `🚫 *UTILISATEUR BANNI* 🚫\n\n📋 *Raison:* ${reason}\n\nCet utilisateur est maintenant banni du groupe.`
        
        await sock.sendMessage(jid, { text: banText })
        return true
    } catch (err) {
        console.error('Error banning user:', err)
        return false
    }
}

async function setRole(sock, jid, targetJid, role) {
    try {
        const validRoles = ['USER', 'MOD', 'ADMIN', 'VIP']
        if (!validRoles.includes(role)) return false

        await runAsync(
            'UPDATE users SET role = ? WHERE jid = ?',
            [role, targetJid]
        )

        const roleText = `✅ Rôle changé en *${role}* pour l'utilisateur.`
        await sock.sendMessage(jid, { text: roleText })
        return true
    } catch (err) {
        console.error('Error setting role:', err)
        return false
    }
}

async function getModerationLogs(sock, jid, targetJid) {
    try {
        const logs = await allAsync(
            'SELECT * FROM moderation_logs WHERE user_jid = ? ORDER BY created_at DESC LIMIT 10',
            [targetJid]
        )

        if (logs.length === 0) {
            await sock.sendMessage(jid, { text: '✅ Aucun avertissement trouvé pour cet utilisateur.' })
            return
        }

        let logText = '📋 *LOGS DE MODÉRATION* 📋\n\n'
        logs.forEach(log => {
            logText += `🔹 *${log.action}* - ${new Date(log.created_at).toLocaleString('fr-FR')}\n   Raison: ${log.reason}\n\n`
        })

        await sock.sendMessage(jid, { text: logText })
    } catch (err) {
        console.error('Error getting moderation logs:', err)
    }
}

async function checkIfMuted(userJid) {
    try {
        const user = await getAsync('SELECT * FROM users WHERE jid = ?', [userJid])
        if (user && user.muted_until > Date.now()) {
            return true
        }
        return false
    } catch (err) {
        console.error('Error checking mute status:', err)
        return false
    }
}

module.exports = {
    warnUser,
    muteUser,
    banUser,
    setRole,
    getModerationLogs,
    checkIfMuted
}
