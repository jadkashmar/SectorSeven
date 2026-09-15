// checkDb.js (or reuse your existing one)
import Database from 'better-sqlite3';
const db = new Database('f1data.db');
console.log(db.prepare('SELECT COUNT(*) as count FROM results WHERE session_key = 11342').get());