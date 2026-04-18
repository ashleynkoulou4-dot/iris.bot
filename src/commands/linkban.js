const config = require('../config')

// Runtime whitelist — starts from config and can be modified by admins at runtime.
// Changes are in-memory only; restart resets to config defaults.
const whitelist = new Set(config.authorizedLinks.map(d => d.toLowerCase()))

/**
 * Extract all hostnames found in a text string.
 * Matches http://, https://, www. prefixes and bare domain patterns.
 */
function extractDomains(text) {
    const urlRegex = /(?:https?:\/\/|www\.)([^\s/?.#]+\.[\w.]+)|(?<!\w)([\w-]+\.(?:com|net|org|io|co|fr|tv|gg|me|app|dev|xyz|info|biz|ly|link|to|be|gl|cc|uk|us|ca|de|jp|br|ru|in|au|es|it|nl|se|no|dk|fi|pl|pt|ar|mx|cl|pe|ve|za|ng|ke|gh|eg|ma|tn|dz|sn|ci|cm|mg|re|mu|gp|mq|nc|pf|yt|pm|wf|tf|bl|mf|sx|cw|aw|bq|sr|gy|gf|fk|gs|sh|ac|io|ai|vg|vi|pr|gu|as|mp|um|pw|fm|mh|ki|nr|tv|to|ws|ck|nu|tk|pn|nf|cx|cc|hm|aq|bv|sj|eh|ps|xk))(?!\w)/gi)
    const found = []
    let match
    while ((match = urlRegex.exec(text)) !== null) {
        // Group 1: domain after http(s):// or www.
        // Group 2: bare domain match
        const domain = (match[1] || match[2] || '').toLowerCase().replace(/^www\./, '')
        if (domain) found.push(domain)
    }
    return found
}

/**
 * Check whether a detected domain is covered by the whitelist.
 * A domain is authorized if it exactly matches or is a subdomain of a whitelisted entry.
 * e.g. "youtu.be" is NOT covered by "youtube.com" — only "youtube.com" and
 * "sub.youtube.com" would be.
 */
function isDomainAuthorized(domain) {
    for (const allowed of whitelist) {
        if (domain === allowed || domain.endsWith('.' + allowed)) {
            return true
        }
    }
    return false
}

/**
 * Retrieve the list of admin JIDs for a group.
 * Returns an empty array if the message is not from a group or metadata fails.
 */
async function getGroupAdmins(sock, groupJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid)
        return metadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id)
    } catch {
        return []
    }
}

/**
 * Main link-ban handler. Call this for every incoming message.
 *
 * Behaviour:
 *  - Ignores private (non-group) chats.
 *  - Ignores messages that contain no URLs.
 *  - Ignores messages whose URLs are all whitelisted.
 *  - If an unauthorized link is found:
 *      • Sender is NOT an admin → ban (remove) them from the group.
 *      • Sender IS an admin    → send a warning without banning.
 */
async function handleLinkBan(sock, msg) {
    const groupJid = msg.key.remoteJid

    // Only act in group chats
    if (!groupJid || !groupJid.endsWith('@g.us')) return

    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ''

    if (!text) return

    const domains = extractDomains(text)
    if (domains.length === 0) return

    const unauthorizedDomains = domains.filter(d => !isDomainAuthorized(d))
    if (unauthorizedDomains.length === 0) return

    const senderJid = msg.key.participant || msg.key.remoteJid
    const admins = await getGroupAdmins(sock, groupJid)
    const senderIsAdmin = admins.includes(senderJid)

    if (senderIsAdmin) {
        await sock.sendMessage(groupJid, {
            text: `⚠️ Attention admin : le lien que tu viens de partager n'est pas dans la liste blanche.\n🔗 Domaine(s) non autorisé(s) : ${unauthorizedDomains.join(', ')}\nUtilise *!addlink <domaine>* pour l'ajouter si nécessaire.`
        })
    } else {
        try {
            await sock.groupParticipantsUpdate(groupJid, [senderJid], 'remove')
            await sock.sendMessage(groupJid, {
                text: `🚫 @${senderJid.split('@')[0]} a été banni pour avoir partagé un lien non autorisé.\n🔗 Domaine(s) détecté(s) : ${unauthorizedDomains.join(', ')}`,
                mentions: [senderJid]
            })
        } catch (err) {
            console.error('[linkban] Impossible de bannir', senderJid, err?.message)
            await sock.sendMessage(groupJid, {
                text: `⚠️ Lien non autorisé détecté de @${senderJid.split('@')[0]}, mais je n'ai pas pu le bannir (vérifiez mes permissions d'admin).`,
                mentions: [senderJid]
            })
        }
    }
}

/**
 * Handle !addlink, !removelink, and !linkwhitelist admin commands.
 * Returns true if the message was a recognized link-management command, false otherwise.
 */
async function handleLinkCommands(sock, msg) {
    const groupJid = msg.key.remoteJid

    // Only act in group chats
    if (!groupJid || !groupJid.endsWith('@g.us')) return false

    const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ''

    const lower = text.toLowerCase().trim()

    // Only admins may manage the whitelist
    const senderJid = msg.key.participant || msg.key.remoteJid
    const admins = await getGroupAdmins(sock, groupJid)
    const senderIsAdmin = admins.includes(senderJid)

    if (lower.startsWith('!addlink')) {
        if (!senderIsAdmin) {
            await sock.sendMessage(groupJid, { text: '🚫 Seuls les admins peuvent modifier la liste blanche des liens.' })
            return true
        }
        const domain = text.slice('!addlink'.length).trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]
        if (!domain) {
            await sock.sendMessage(groupJid, { text: '⚠️ Usage : *!addlink <domaine>*\nExemple : !addlink youtube.com' })
            return true
        }
        if (whitelist.has(domain)) {
            await sock.sendMessage(groupJid, { text: `ℹ️ *${domain}* est déjà dans la liste blanche.` })
        } else {
            whitelist.add(domain)
            await sock.sendMessage(groupJid, { text: `✅ *${domain}* a été ajouté à la liste blanche des liens autorisés.` })
        }
        return true
    }

    if (lower.startsWith('!removelink')) {
        if (!senderIsAdmin) {
            await sock.sendMessage(groupJid, { text: '🚫 Seuls les admins peuvent modifier la liste blanche des liens.' })
            return true
        }
        const domain = text.slice('!removelink'.length).trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]
        if (!domain) {
            await sock.sendMessage(groupJid, { text: '⚠️ Usage : *!removelink <domaine>*\nExemple : !removelink youtube.com' })
            return true
        }
        if (!whitelist.has(domain)) {
            await sock.sendMessage(groupJid, { text: `ℹ️ *${domain}* n'est pas dans la liste blanche.` })
        } else {
            whitelist.delete(domain)
            await sock.sendMessage(groupJid, { text: `🗑️ *${domain}* a été retiré de la liste blanche des liens autorisés.` })
        }
        return true
    }

    if (lower === '!linkwhitelist') {
        if (!senderIsAdmin) {
            await sock.sendMessage(groupJid, { text: '🚫 Seuls les admins peuvent consulter la liste blanche des liens.' })
            return true
        }
        if (whitelist.size === 0) {
            await sock.sendMessage(groupJid, { text: '📋 La liste blanche est vide. Tous les liens sont bloqués.' })
        } else {
            const list = [...whitelist].sort().map((d, i) => `${i + 1}. ${d}`).join('\n')
            await sock.sendMessage(groupJid, { text: `📋 *Liens autorisés (liste blanche) :*\n${list}` })
        }
        return true
    }

    return false
}

module.exports = { handleLinkBan, handleLinkCommands }
