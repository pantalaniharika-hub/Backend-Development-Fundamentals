const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// 1. GET /
app.get('/', (req, res) => {
  res.status(200).send('Welcome to Node.js and Express Server!');
});

// 2. GET /about
app.get('/about', (req, res) => {
  res.status(200).json({
    name: "Niharika Pantala",
    section: "CSE-DS 1B"
  });
});

// 3. GET /time
app.get('/time', (req, res) => {
  res.status(200).json({
    currentTime: new Date().toString()
  });
});

// 4. 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;
