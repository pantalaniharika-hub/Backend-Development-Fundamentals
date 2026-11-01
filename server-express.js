/**
 * Lab 01 - Tasks 4, 5, 6 & 7: Express.js Web Server
 * 
 * Objective:
 * Implement a robust Express.js server providing structured routing,
 * JSON serialization, route lifecycle logging, and graceful 404 handling.
 */

const express = require('express');
const app = express();

// Port configuration: dynamically injected by hosting platforms (e.g. Render) or defaults to 3000
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. GLOBAL MIDDLEWARE: REQUEST & STATUS LOGGER (Task 7)
// ==========================================
// Logs method, requested URL, and the resulting HTTP status code upon response finish
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Built-in JSON body parser middleware (good backend hygiene)
app.use(express.json());

// ==========================================
// 2. ROUTES (Task 5)
// ==========================================

/**
 * Route: GET /
 * Description: Welcome text endpoint
 * Status Code: 200 OK
 */
app.get('/', (req, res) => {
  res.status(200).send('Welcome to Backend Development Fundamentals - Lab 01!');
});

/**
 * Route: GET /about
 * Description: Returns student details in structured JSON format
 * Status Code: 200 OK
 */
app.get('/about', (req, res) => {
  const studentProfile = {
    name: "Pantala Niharika",
    registrationNumber: "252U1R3070",
    section: "CSE-DS-1B",
    course: "B.Tech Computer Science and Engineering",
    subject: "Backend Development Fundamentals",
    lab: "Lab 01: Node.js and Express Server"
  };

  res.status(200).json(studentProfile);
});

/**
 * Route: GET /time
 * Description: Returns current date and time using JavaScript new Date()
 * Status Code: 200 OK
 */
app.get('/time', (req, res) => {
  const now = new Date();

  res.status(200).json({
    iso: now.toISOString(),
    utc: now.toUTCString(),
    localTime: now.toLocaleString(),
    timestampMs: now.getTime(),
    timezoneOffsetMinutes: now.getTimezoneOffset()
  });
});

// ==========================================
// 3. 404 HANDLER FOR UNKNOWN ROUTES (Task 6)
// ==========================================
// Any request that fails to match the routes above will reach this catch-all middleware
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: `The requested path '${req.originalUrl}' does not exist on this server.`,
    availableEndpoints: [
      "GET /",
      "GET /about",
      "GET /time"
    ]
  });
});

// ==========================================
// 4. SERVER INITIALIZATION (Task 4)
// ==========================================
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Express.js Web Server is active!`);
  console.log(`📡 Local URL: http://localhost:${PORT}`);
  console.log(`📋 Available Routes:`);
  console.log(`   - GET  /         (Welcome message)`);
  console.log(`   - GET  /about    (Student details JSON)`);
  console.log(`   - GET  /time     (Current date and time)`);
  console.log(`   - ANY  /*        (404 Not Found fallback)`);
  console.log(`📌 Press Ctrl + C to stop`);
  console.log(`====================================================`);
});
