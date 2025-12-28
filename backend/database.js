// Database setup and connection
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'legal_cases.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
function getDatabase() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database');
        }
    });
}

// Initialize database schema
function initializeDatabase() {
    const db = getDatabase();
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table for authentication
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'paralegal',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Cases table
            db.run(`CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                status TEXT DEFAULT 'pending',
                personal_info TEXT NOT NULL,
                case_info TEXT NOT NULL,
                additional_info TEXT,
                assigned_to INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_to) REFERENCES users(id)
            )`);

            // Case files table
            db.run(`CREATE TABLE IF NOT EXISTS case_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_type TEXT NOT NULL,
                file_data BLOB NOT NULL,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
            )`);

            // Case notes table
            db.run(`CREATE TABLE IF NOT EXISTS case_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                case_id TEXT NOT NULL,
                user_id INTEGER,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);

            // Time entries table
            db.run(`CREATE TABLE IF NOT EXISTS time_entries (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                user_id INTEGER,
                date DATE NOT NULL,
                description TEXT NOT NULL,
                hours REAL NOT NULL,
                rate REAL NOT NULL,
                billable INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);

            // Expenses table
            db.run(`CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                user_id INTEGER,
                date DATE NOT NULL,
                category TEXT NOT NULL,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);

            // Invoices table
            db.run(`CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY,
                invoice_number TEXT UNIQUE NOT NULL,
                case_id TEXT NOT NULL,
                date DATE NOT NULL,
                due_date DATE,
                amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
            )`);

            // Trust transactions table
            db.run(`CREATE TABLE IF NOT EXISTS trust_transactions (
                id TEXT PRIMARY KEY,
                case_id TEXT NOT NULL,
                user_id INTEGER,
                date DATE NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )`);

            // Create indexes for better performance
            db.run(`CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_time_entries_case ON time_entries(case_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_case ON expenses(case_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_case ON invoices(case_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_trust_case ON trust_transactions(case_id)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_trust_date ON trust_transactions(date)`);

            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database initialized successfully');
                    resolve();
                }
            });
        });
    });
}

// Database query helper functions
class Database {
    constructor() {
        this.db = getDatabase();
    }

    // Generic query method
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Generic run method (for INSERT, UPDATE, DELETE)
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Get single row
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = {
    getDatabase,
    initializeDatabase,
    Database
};


