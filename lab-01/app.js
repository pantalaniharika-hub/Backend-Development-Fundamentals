const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// 1. GET /
app.get('/', (request, response) => {
  response.send('Welcome to Node.js and Express Server!');
});

// 2. GET /about
app.get('/about', (request, response) => {
  response.send({
    name: "Niharika Pantala",
    section: "CSE-DS 1B",
    registrationNumber: "252U1R3070"
  });
});

// 3. GET /time
app.get('/time', (request, response) => {
  response.send({
    currentTime: new Date().toString()
  });
});

// 4. 404 handler for unknown routes
app.use((request, response) => {
  response.status(404).send('404 - Page Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;
