/**
 * Database Initialization Script for Lab 3
 * Student: Niharika Pantala | Reg No: 252U1R3070 | Section: CSE-DS (2B)
 * University: Aurora University | Subject: Backend Development Fundamentals
 * Faculty: Mr. Yugandhar
 */

const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const dbPath = path.join(__dirname, 'book.db');

const initialBooks = [
  { title: 'Clean Code', author: 'Robert C. Martin', price: 650, pages: 464 },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', price: 720, pages: 352 },
  { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', price: 950, pages: 1312 },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 380, pages: 176 },
  { title: "You Don't Know JS: Scope & Closures", author: 'Kyle Simpson', price: 420, pages: 98 },
  { title: 'Python Crash Course', author: 'Eric Matthes', price: 540, pages: 544 },
  { title: 'Fluent Python', author: 'Luciano Ramalho', price: 800, pages: 792 },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', price: 890, pages: 616 },
  { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma et al.', price: 750, pages: 395 },
  { title: 'Node.js Design Patterns', author: 'Mario Casciaro', price: 620, pages: 520 },
  { title: 'Learning SQL', author: 'Alan Beaulieu', price: 450, pages: 380 },
  { title: 'Effective Java', author: 'Joshua Bloch', price: 680, pages: 412 }
];

async function initializeDatabase() {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database at:', dbPath);

    // Create table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    // Check existing count
    const countResult = await db.get('SELECT COUNT(*) AS count FROM book;');
    console.log(`Current book count: ${countResult.count}`);

    if (countResult.count === 0) {
      console.log('Seeding initial 12 book records...');
      const insertQuery = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?);
      `;

      for (const b of initialBooks) {
        await db.run(insertQuery, [b.title, b.author, b.price, b.pages]);
      }
      console.log('Sample book records inserted successfully.');
    }

    const rows = await db.all('SELECT * FROM book;');
    console.log(`\nVerified Database Contents (${rows.length} total books):`);
    console.table(rows);

    await db.close();
    console.log('Database initialized and closed successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();

