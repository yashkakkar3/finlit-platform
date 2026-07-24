const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/finlit.db');

// Ensure the data directory exists (SQLite won't create it for you).
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// Auto-initialize schema on first run — this is what makes SQLite
// "zero setup": no server to install, no CREATE DATABASE step.
// Safe to run every time since every statement is CREATE TABLE IF NOT EXISTS.
function initSchema() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}

// Seeds demo modules/lessons only if the modules table is empty,
// so re-running the server never duplicates data.
function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM modules').get();
  if (count === 0) {
    const seedPath = path.join(__dirname, 'seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    db.exec(seed);
    console.log('[db] Seeded demo modules/lessons');
  }
}

// node:sqlite's DatabaseSync has no built-in .transaction() helper
// (unlike better-sqlite3), so this wraps BEGIN/COMMIT/ROLLBACK by hand.
// Use it anywhere multiple writes must succeed or fail together.
function withTransaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

initSchema();
seedIfEmpty();

module.exports = db;
module.exports.withTransaction = withTransaction;
