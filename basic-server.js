/**
 * Lab 1 – Basic HTTP Server
 * Backend Development Fundamentals
 * 
 * Demonstration of basic Node.js HTTP server using native 'http' module
 * and http.createServer() without external frameworks.
 * 
 * Student Details:
 * - Name: Niharika Pantala
 * - Section: CSE-DS 1B
 * - Registration Number: 252U1R3070
 */

const http = require('http');

// Port configuration: fallback to 3000
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Create basic HTTP server
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Incoming Request: ${req.method} ${req.url}`);

  // Simple routing for demonstration
  if (req.url === '/' && req.method === 'GET') {
    res.statusCode = 200;
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Powered-By': 'Node.js Core HTTP'
    });
    res.end('Welcome to Node.js HTTP Server! (Built with http.createServer)');
  } else if (req.url === '/about' && req.method === 'GET') {
    res.statusCode = 200;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      name: "Niharika Pantala",
      section: "CSE-DS 1B"
    }, null, 2));
  } else if (req.url === '/time' && req.method === 'GET') {
    res.statusCode = 200;
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      currentTime: new Date().toString()
    }, null, 2));
  } else {
    res.statusCode = 404;
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - Page Not Found');
  }

  console.log(`[${timestamp}] Handled ${req.method} ${req.url} -> Status: ${res.statusCode}`);
});

// Start listening when run directly
if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`http://localhost:${PORT}`);
  });
}

module.exports = server;

