/**
 * Database Initialization Script for Lab 4
 * Student: Niharika Pantala | Reg No: 252U1R3070 | Section: CSE-DS (2B)
 * University: Aurora University | Subject: Backend Development Fundamentals
 * Faculty: Mr. Yugandhar
 */

const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'user.db');

async function initializeDatabase() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database at:', dbPath);

    // Create table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        password TEXT
      );
    `);
    console.log('User table created successfully.');

    // Check existing users count
    const countRow = await db.get('SELECT COUNT(*) AS count FROM user;');
    console.log(`Current user count: ${countRow.count}`);

    if (countRow.count === 0) {
      console.log('Seeding initial test user with bcrypt password hash...');
      const samplePassword = 'Niharika123';
      const hashedPassword = await bcrypt.hash(samplePassword, 10);

      const insertQuery = `
        INSERT INTO user (username, name, password)
        VALUES (?, ?, ?);
      `;
      await db.run(insertQuery, ['niharika', 'Niharika Pantala', hashedPassword]);
      console.log('Sample user "niharika" registered successfully with bcrypt hash.');
    }

    const rows = await db.all('SELECT id, username, name, password FROM user;');
    console.log('\nVerified Database Contents:');
    console.table(rows);

    await db.close();
    console.log('Database initialized and closed successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();

