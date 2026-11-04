/**
 * Lab 03 – REST API, Query Parameters, Validation, and Debugging
 * 
 * Student Name: Niharika Pantala
 * Registration Number: 252U1R3070
 * Section: CSE-DS (2B)
 * University: Aurora University
 * Subject: Backend Development Fundamentals
 * Lab Number: 03
 * Faculty: Mr. Yugandhar
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

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Validation helper for book payload (POST and PUT)
const validateBook = (body, response) => {
  const { title, author, price, pages } = body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    response.status(400).json({ message: 'Title is required' });
    return false;
  }
  if (!author || typeof author !== 'string' || !author.trim()) {
    response.status(400).json({ message: 'Author is required' });
    return false;
  }
  if (price === undefined || price === null || price === '') {
    response.status(400).json({ message: 'Price is required' });
    return false;
  }
  if (isNaN(Number(price)) || typeof price === 'boolean') {
    response.status(400).json({ message: 'Price must be a number' });
    return false;
  }
  if (Number(price) < 0) {
    response.status(400).json({ message: 'Price cannot be negative' });
    return false;
  }
  if (pages === undefined || pages === null || pages === '' || isNaN(Number(pages)) || typeof pages === 'boolean' || !Number.isInteger(Number(pages)) || Number(pages) <= 0) {
    response.status(400).json({ message: 'Pages must be a positive integer' });
    return false;
  }
  return true;
};

// Root Route: Redirects http://localhost:3000 to http://localhost:3000/books/
app.get('/', (request, response) => {
  response.redirect('/books/');
});

// 1. GET ALL BOOKS (with search, sort, pagination, and price range filters)
app.get(['/books/', '/books'], async (request, response) => {
  const {
    search_q = '',
    order_by = 'id',
    order = 'ASC',
    limit = 10,
    offset = 0,
    min_price,
    max_price
  } = request.query;

  const allowedColumns = ['id', 'title', 'author', 'price', 'pages'];
  const validCol = String(order_by).toLowerCase();
  const validDir = String(order).toUpperCase();

  if (!allowedColumns.includes(validCol)) {
    return response.status(400).json({
      message: `Invalid order_by column. Allowed columns: ${allowedColumns.join(', ')}`
    });
  }
  if (!['ASC', 'DESC'].includes(validDir)) {
    return response.status(400).json({
      message: 'Invalid order direction. Allowed values: ASC, DESC'
    });
  }

  const limitNum = Number(limit);
  const offsetNum = Number(offset);
  if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum <= 0) {
    return response.status(400).json({ message: 'Limit must be a positive integer' });
  }
  if (isNaN(offsetNum) || !Number.isInteger(offsetNum) || offsetNum < 0) {
    return response.status(400).json({ message: 'Offset must be a non-negative integer' });
  }

  const minNum = min_price !== undefined ? Number(min_price) : undefined;
  const maxNum = max_price !== undefined ? Number(max_price) : undefined;
  if (minNum !== undefined && (isNaN(minNum) || minNum < 0)) {
    return response.status(400).json({ message: 'Invalid min_price. Must be a non-negative number' });
  }
  if (maxNum !== undefined && (isNaN(maxNum) || maxNum < 0)) {
    return response.status(400).json({ message: 'Invalid max_price. Must be a non-negative number' });
  }
  if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
    return response.status(400).json({ message: 'Minimum price cannot be greater than maximum price' });
  }

  const conditions = [];
  const params = [];

  if (search_q.trim()) {
    conditions.push('title LIKE ?');
    params.push(`%${search_q.trim()}%`);
  }
  if (minNum !== undefined && maxNum !== undefined) {
    conditions.push('price BETWEEN ? AND ?');
    params.push(minNum, maxNum);
  } else if (minNum !== undefined) {
    conditions.push('price >= ?');
    params.push(minNum);
  } else if (maxNum !== undefined) {
    conditions.push('price <= ?');
    params.push(maxNum);
  }

  let sql = 'SELECT * FROM book';
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  sql += ` ORDER BY ${validCol} ${validDir} LIMIT ? OFFSET ?;`;
  params.push(limitNum, offsetNum);

  const books = await db.all(sql, params);
  response.status(200).json({
    message: 'Books retrieved successfully',
    data: books
  });
});

// 2. GET SINGLE BOOK BY ID
app.get(['/books/:bookId/', '/books/:bookId'], async (request, response) => {
  const bookId = Number(request.params.bookId);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return response.status(400).json({ message: 'Invalid book ID' });
  }

  const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);
  if (!book) {
    return response.status(404).json({ message: 'Book not found' });
  }

  response.status(200).json({
    message: 'Book retrieved successfully',
    data: book
  });
});

// 3. POST - ADD NEW BOOK
app.post(['/books/', '/books'], async (request, response) => {
  if (!validateBook(request.body, response)) return;
  const { title, author, price, pages } = request.body;

  const insertQuery = `
    INSERT INTO book (title, author, price, pages)
    VALUES (?, ?, ?, ?);
  `;
  const result = await db.run(insertQuery, [title.trim(), author.trim(), Number(price), Number(pages)]);

  response.status(201).json({
    message: 'Book created successfully',
    bookId: result.lastID
  });
});

// 4. PUT - UPDATE BOOK
app.put(['/books/:bookId/', '/books/:bookId'], async (request, response) => {
  const bookId = Number(request.params.bookId);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return response.status(400).json({ message: 'Invalid book ID' });
  }

  if (!validateBook(request.body, response)) return;
  const { title, author, price, pages } = request.body;

  const existing = await db.get('SELECT id FROM book WHERE id = ?;', [bookId]);
  if (!existing) {
    return response.status(404).json({ message: 'Book not found' });
  }

  const updateQuery = `
    UPDATE book
    SET title = ?, author = ?, price = ?, pages = ?
    WHERE id = ?;
  `;
  await db.run(updateQuery, [title.trim(), author.trim(), Number(price), Number(pages), bookId]);

  response.status(200).json({ message: 'Book updated successfully' });
});

// 5. DELETE - DELETE BOOK
app.delete(['/books/:bookId/', '/books/:bookId'], async (request, response) => {
  const bookId = Number(request.params.bookId);
  if (!Number.isInteger(bookId) || bookId <= 0) {
    return response.status(400).json({ message: 'Invalid book ID' });
  }

  const result = await db.run('DELETE FROM book WHERE id = ?;', [bookId]);
  if (result.changes === 0) {
    return response.status(404).json({ message: 'Book not found' });
  }

  response.status(200).json({ message: 'Book deleted successfully' });
});

// 404 Route for unknown URLs
app.use((request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

module.exports = app;
