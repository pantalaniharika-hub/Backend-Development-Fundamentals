/**
 * Lab 02 – SQLite and Relational Database Operations
 * 
 * Student: Niharika Pantala | Section: CSE-DS 1B | Aurora University
 * Faculty: Joel Prashanth D. | Reg No: [Your Registration Number Here]
 */

const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'book.db');
let db = null;

// Connect to SQLite Database and Start Server
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

// 1. GET ALL BOOKS
app.get('/books/', async (request, response) => {
  const books = await db.all('SELECT * FROM book;');
  response.status(200).json(books);
});

// 2. GET A SINGLE BOOK BY ID
app.get('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;
  const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);

  if (!book) {
    return response.status(404).json({ error: 'Book not found' });
  }
  response.status(200).json(book);
});

// 3. POST - ADD A NEW BOOK
app.post('/books/', async (request, response) => {
  const { title, author, price, pages } = request.body;

  const insertQuery = `
    INSERT INTO book (title, author, price, pages)
    VALUES (?, ?, ?, ?);
  `;
  const result = await db.run(insertQuery, [title, author, price, pages]);

  response.status(201).json({
    message: 'Book Added Successfully',
    bookId: result.lastID
  });
});

// 4. PUT - UPDATE A BOOK
app.put('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;
  const { title, author, price, pages } = request.body;

  const updateQuery = `
    UPDATE book
    SET title = ?, author = ?, price = ?, pages = ?
    WHERE id = ?;
  `;
  const result = await db.run(updateQuery, [title, author, price, pages, bookId]);

  if (result.changes === 0) {
    return response.status(404).json({ error: 'Book not found' });
  }
  response.status(200).json({ message: 'Book Updated Successfully' });
});

// 5. DELETE - DELETE A BOOK
app.delete('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;

  const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId]);

  if (result.changes === 0) {
    return response.status(404).json({ error: 'Book not found' });
  }
  response.status(200).json({ message: 'Book Deleted Successfully' });
});

// 404 Route for unknown URLs
app.use((request, response) => {
  response.status(404).json({ error: 'Endpoint Not Found' });
});

module.exports = app;
