/**
 * Lab 02 – SQLite and Relational Database Operations
 * 
 * Student Name: Niharika Pantala
 * Section: CSE-DS 1B
 * University: Aurora University
 * Faculty: Joel Prashanth D.
 * Registration Number: [Your Registration Number Here]
 */

const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

// Enable CORS so Postman Web in browser can connect to localhost
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    return response.sendStatus(200);
  }
  next();
});

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'book.db');
let db = null;

// Initialize Database connection and start server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// 1. GET ALL BOOKS: GET /books/
app.get('/books/', async (request, response) => {
  try {
    const books = await db.all('SELECT * FROM book;');
    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 2. GET A SPECIFIC BOOK: GET /books/:bookId/
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);

    if (!book) {
      return response.status(404).json({ error: 'Book not found' });
    }
    response.status(200).json(book);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 3. ADD A NEW BOOK: POST /books/
app.post('/books/', async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({ error: 'All fields (title, author, price, pages) are required' });
    }

    const insertQuery = `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`;
    const result = await db.run(insertQuery, [title, author, price, pages]);

    response.status(201).json({
      message: 'Book Added Successfully',
      bookId: result.lastID
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 4. UPDATE A BOOK: PUT /books/:bookId/
app.put('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    const existingBook = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);
    if (!existingBook) {
      return response.status(404).json({ error: 'Book not found' });
    }

    const updateQuery = `
      UPDATE book
      SET title = ?, author = ?, price = ?, pages = ?
      WHERE id = ?;
    `;
    await db.run(updateQuery, [title, author, price, pages, bookId]);

    response.status(200).json({ message: 'Book Updated Successfully' });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 5. DELETE A BOOK: DELETE /books/:bookId/
app.delete('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;

    const existingBook = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);
    if (!existingBook) {
      return response.status(404).json({ error: 'Book not found' });
    }

    await db.run('DELETE FROM book WHERE id = ?;', [bookId]);
    response.status(200).json({ message: 'Book Deleted Successfully' });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 404 Route for unknown URLs
app.use((request, response) => {
  response.status(404).json({ error: 'Endpoint Not Found' });
});

module.exports = app;
