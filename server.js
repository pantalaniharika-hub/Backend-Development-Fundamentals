/**
 * Lab 1 – Node.js and Express Server
 * Backend Development Fundamentals
 * 
 * Student Details:
 * - Name: Niharika Pantala
 * - Section: CSE-DS 1B
 * - Registration Number: 252U1R3070
 */

const express = require('express');
const app = express();

// Configuration: Environment port with fallback to 3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Built-in middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

/**
 * 1. GET /
 * Display: Welcome to Node.js and Express Server!
 * Status: 200 OK
 * Only the message is visible (no buttons or links).
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to Node.js and Express Server!');
});

/**
 * 2. GET /about
 * Return JSON containing:
 * - name: Niharika Pantala
 * - section: CSE-DS 1B
 * Status: 200 OK
 */
app.get('/about', (req, res) => {
  res.status(200).json({
    name: "Niharika Pantala",
    section: "CSE-DS 1B"
  });
});

/**
 * 3. GET /time
 * Return current date and time using new Date()
 * Status: 200 OK
 */
app.get('/time', (req, res) => {
  res.status(200).json({
    currentTime: new Date().toString()
  });
});

/**
 * 4. Any unknown route:
 * Return 404 - Page Not Found.
 * Status: 404
 */
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});


// Start Express Server only when run directly
if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`http://localhost:${PORT}`);
  });
}

module.exports = app;

