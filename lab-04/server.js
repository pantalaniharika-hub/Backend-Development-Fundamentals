/**
 * Lab 04 – Registration, Login and JWT
 * 
 * Student Name: Niharika Pantala
 * Registration Number: 252U1R3070
 * Section: CSE-DS (2B)
 * University: Aurora University
 * Subject: Backend Development Fundamentals
 * Lab Number: 04
 * Faculty: Mr. Yugandhar
 */

const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'user.db');
let db = null;

// Constant for JWT secret key for Lab 4
// Note: In Lab 8, this secret key will be moved to an environment variable (.env) for enhanced production security.
const secretKey = 'MY_SECRET_TOKEN';

// 1. Initialize SQLite Database and Start Server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create user table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        name TEXT,
        password TEXT
      );
    `);

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Root Route: Helper message
app.get('/', (request, response) => {
  response.status(200).json({
    message: 'Backend Development Fundamentals - Lab 04: Registration, Login and JWT API is running'
  });
});

// Informational GET routes for browser inspection
app.get(['/register/', '/register'], (request, response) => {
  response.status(200).json({
    message: 'POST request expected. Please send a POST request with JSON body containing username, name, and password.'
  });
});

app.get(['/login/', '/login'], (request, response) => {
  response.status(200).json({
    message: 'POST request expected. Please send a POST request with JSON body containing username and password.'
  });
});

// 2. POST /register/ - Register New User
app.post(['/register/', '/register'], async (request, response) => {
  try {
    const { username, name, password } = request.body || {};

    // Validate that all three fields are provided and are non-empty strings
    if (
      !username ||
      !name ||
      !password ||
      typeof username !== 'string' ||
      typeof name !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !name.trim() ||
      !password.trim()
    ) {
      return response.status(400).json({ message: 'All fields are required' });
    }

    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    // Check whether the username already exists in the database
    const selectUserQuery = 'SELECT * FROM user WHERE username = ?;';
    const dbUser = await db.get(selectUserQuery, [trimmedUsername]);

    if (dbUser !== undefined) {
      return response.status(400).json({ message: 'User already exists' });
    }

    // Hash the password using bcrypt with salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into SQLite database using parameterized query
    const insertUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?);
    `;
    await db.run(insertUserQuery, [trimmedUsername, trimmedName, hashedPassword]);

    return response.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    return response.status(500).json({ message: 'Internal server error' });
  }
});

// 3. POST /login/ - Authenticate User and Issue JWT
app.post(['/login/', '/login'], async (request, response) => {
  try {
    const { username, password } = request.body || {};

    // Validate that both fields are provided and are non-empty
    if (
      !username ||
      !password ||
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password.trim()
    ) {
      return response.status(400).json({ message: 'All fields are required' });
    }

    const trimmedUsername = username.trim();

    // Search for the username in the database
    const selectUserQuery = 'SELECT * FROM user WHERE username = ?;';
    const dbUser = await db.get(selectUserQuery, [trimmedUsername]);

    if (dbUser === undefined) {
      return response.status(400).json({ message: 'Invalid user' });
    }

    // Compare entered password with stored bcrypt hash
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordMatched) {
      return response.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token containing ONLY the username in payload
    const payload = {
      username: dbUser.username
    };

    const jwtToken = jwt.sign(payload, secretKey, {
      expiresIn: '1h'
    });

    return response.status(200).json({
      jwt_token: jwtToken
    });
  } catch (error) {
    return response.status(500).json({ message: 'Internal server error' });
  }
});

// 404 Route for unknown URLs
app.use((request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ message: 'Invalid JSON payload' });
  }
  return response.status(500).json({ message: 'Internal server error' });
});

module.exports = app;

