// checkDb.js
import Database from 'better-sqlite3';
const db = new Database('f1data.db');

console.log('Sessions:', db.prepare('SELECT * FROM sessions').all());
console.log('Drivers:', db.prepare('SELECT * FROM drivers').all());
console.log('Results:', db.prepare('SELECT * FROM results').all());