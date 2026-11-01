/**
 * SQLite CLI Utility for Lab 2
 * Allows executing SQL queries directly against book.db from the command line:
 * 
 * Usage:
 *   node cli.js "SELECT * FROM book;"
 *   node cli.js "SELECT * FROM book WHERE id = 1;"
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'book.db');
const db = new sqlite3.Database(dbPath);

const query = process.argv.slice(2).join(' ').trim();

if (!query) {
  console.log("Usage: node cli.js \"<SQL_QUERY>\"");
  console.log("Example: node cli.js \"SELECT * FROM book;\"");
  process.exit(0);
}

console.log(`Executing SQL: ${query}`);
console.log("--------------------------------------------------------------------------------");

if (query.toUpperCase().startsWith("SELECT")) {
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("SQL Error:", err.message);
    } else {
      console.table(rows);
      console.log(`\nTotal rows: ${rows.length}`);
    }
    db.close();
  });
} else {
  db.run(query, [], function (err) {
    if (err) {
      console.error("SQL Error:", err.message);
    } else {
      console.log(`Query executed successfully. Changes: ${this.changes}, Last ID: ${this.lastID}`);
    }
    db.close();
  });
}

