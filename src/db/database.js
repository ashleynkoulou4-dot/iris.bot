/**
 * src/db/database.js
 * SQLite Database Setup & Schema
 */

const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'iris.db')
const db = new sqlite3.Database(dbPath)

// Helper to promisify database operations
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err)
            else resolve({ id: this.lastID, changes: this.changes })
        })
    })
}

const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err)
            else resolve(rows || [])
        })
    })
}

const getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err)
            else resolve(row)
        })
    })
}

// Initialize Database Schema
async function initDatabase() {
    try {
        console.log('📊 Initializing database...')

        // ── Users Table ──────────────────────────────────────────
        await runAsync(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                jid TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                points INTEGER DEFAULT 0,
                balance INTEGER DEFAULT 1000,
                level INTEGER DEFAULT 1,
                experience INTEGER DEFAULT 0,
                role TEXT DEFAULT 'USER',
                warnings INTEGER DEFAULT 0,
                muted_until INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // ── Game Scores Table ────────────────────────────────────
        await runAsync(`
            CREATE TABLE IF NOT EXISTS game_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_jid TEXT NOT NULL,
                game_type TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_jid) REFERENCES users(jid)
            )
        `)

        // ── AI Learning Table ────────────────────────────────────
        await runAsync(`
            CREATE TABLE IF NOT EXISTS ai_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT UNIQUE NOT NULL,
                response TEXT NOT NULL,
                created_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // ── Moderation Log Table ─────────────────────────────────
        await runAsync(`
            CREATE TABLE IF NOT EXISTS moderation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_jid TEXT NOT NULL,
                action TEXT NOT NULL,
                reason TEXT,
                mod_jid TEXT,
                duration INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_jid) REFERENCES users(jid)
            )
        `)

        // ── Reminders Table ─────────────────────────────────────
        await runAsync(`
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_jid TEXT NOT NULL,
                message TEXT NOT NULL,
                reminder_time DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_completed BOOLEAN DEFAULT 0,
                FOREIGN KEY(user_jid) REFERENCES users(jid)
            )
        `)

        // ── Link Ban List ────────────────────────────────────────
        await runAsync(`
            CREATE TABLE IF NOT EXISTS banned_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                link TEXT UNIQUE NOT NULL,
                added_by TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // ── Daily Check-in Table ────────────────────────────────
        await runAsync(`
            CREATE TABLE IF NOT EXISTS daily_checkins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_jid TEXT NOT NULL,
                checkin_date DATE UNIQUE NOT NULL,
                bonus_points INTEGER DEFAULT 100,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_jid) REFERENCES users(jid)
            )
        `)

        console.log('✅ Database initialized successfully!')
        return true
    } catch (err) {
        console.error('❌ Database initialization error:', err)
        return false
    }
}

// Export functions
module.exports = {
    db,
    initDatabase,
    runAsync,
    allAsync,
    getAsync
}

// Run initialization if executed directly
if (require.main === module) {
    initDatabase().then(() => {
        console.log('Database ready!')
        process.exit(0)
    })
}
