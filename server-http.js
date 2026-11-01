/**
 * Lab 01 - Task 3: Plain HTTP Server using Node.js built-in 'http' module
 * 
 * Objective:
 * Create a simple HTTP web server without external libraries to understand
 * low-level HTTP primitives, stream handling, and event loop listeners.
 */

const http = require('http');

// Configurable port with fallback to 3000
const PORT = process.env.PORT || 3000;

// Create HTTP server instance
// The callback (request listener) executes on every incoming HTTP request.
// req: http.IncomingMessage (Readable Stream)
// res: http.ServerResponse (Writable Stream)
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Incoming Request: ${req.method} ${req.url}`);

  // Set HTTP Response Headers
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Powered-By': 'Node.js Core HTTP'
  });

  // Write response body and terminate response stream
  res.end('Hello');

  console.log(`[${timestamp}] Response Sent: Status Code 200 OK`);
});

// Start listening for incoming TCP connections on the specified port
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Plain Node.js HTTP Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📌 Press Ctrl + C to stop the server`);
  console.log(`====================================================`);
});
