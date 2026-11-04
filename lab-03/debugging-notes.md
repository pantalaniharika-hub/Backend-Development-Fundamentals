# Lab 3: Debugging Notes & Common Backend Errors

**Student Name:** Niharika Pantala  
**Registration Number:** 252U1R3070  
**Section:** CSE-DS (2B)  
**University:** Aurora University  
**Subject:** Backend Development Fundamentals  
**Lab Number:** 03  
**Lab Title:** REST API, Query Parameters, Validation, and Debugging  
**Faculty:** Mr. Yugandhar  

---

## Overview

During backend development with Node.js, Express, and SQLite, developers routinely encounter runtime exceptions and logical bugs. Effective backend engineering requires understanding root causes, reading error stack traces, and implementing standard fixes.

This document analyzes four critical errors encountered during the development of Lab 3, explaining their underlying causes, symptom logs, incorrect code patterns, and verified solutions.

---

## 1. Error 1: Port Conflict (`EADDRINUSE`)

### What It Means
The error `Error: listen EADDRINUSE: address already in use :::3000` occurs when an Express server attempts to bind and listen to a network port (e.g., port `3000`) that is already occupied by another active process or previous instance of the server.

### Symptom & Error Stack Trace
```text
Error: listen EADDRINUSE: address already in use :::3000
    at Server.setupListenHandle [as _listen2] (node:net:1904:16)
    at listenInCluster (node:net:1961:12)
    at Server.listen (node:net:2063:7)
    at initializeDBAndServer (C:\Users\panta\... \lab-03\server.js:33:9)
Emitted 'error' event on Server instance at:
    at emitErrorNT (node:net:1940:8)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3000
}
```

### Why It Happens
1. A previous Node.js process was not terminated cleanly (e.g., terminal closed without sending `SIGINT` / `Ctrl+C`).
2. Another application or service (such as another dev server, Docker container, or Lab 1 / Lab 2 instance) is already listening on port 3000.
3. Multiple terminal tabs are running `npm start` simultaneously.

### How to Fix It

#### Method A: Identify and Terminate the Process Holding the Port

**On Windows (PowerShell / Command Prompt):**
```powershell
# 1. Find the Process ID (PID) using port 3000
netstat -ano | findstr :3000

# Example output:
# TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING       14528

# 2. Kill the process forcefully using its PID
taskkill /PID 14528 /F
```

**On Linux / macOS:**
```bash
# 1. Find and kill process listening on port 3000
lsof -i :3000
kill -9 <PID>

# Or in a single command:
npx kill-port 3000
```

#### Method B: Use a Dynamic / Configurable Port Fallback
Instead of hardcoding port `3000`, configure Express to read from environment variables or provide fallback logic:

**Incorrect Code (Hardcoded Port):**
```javascript
// Hardcoded port causes EADDRINUSE if 3000 is occupied
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Correct Code (Environment Variable Fallback):**
```javascript
// Allows changing port via environment variable (e.g., PORT=3001 npm start)
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Graceful handling of EADDRINUSE in code
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free the port or specify another PORT.`);
    process.exit(1);
  }
});
```

---

## 2. Error 2: Wrong Import Path (`MODULE_NOT_FOUND`)

### What It Means
The error `Error: Cannot find module` occurs when Node.js's CommonJS module resolver (`require()`) fails to locate the specified file or npm package.

### Symptom & Error Stack Trace
```text
node:internal/modules/cjs/loader:1252
  throw err;
  ^

Error: Cannot find module './db/database'
Require stack:
- C:\Users\panta\...\lab-03\server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1249:15)
    at defaultResolve (node:internal/modules/cjs/loader:1396:20)
    at Module._load (node:internal/modules/cjs/loader:1075:20)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    'C:\\Users\\panta\\...\\lab-03\\server.js'
  ]
}
```

### Why It Happens
1. Typographical error in the module name or relative path (e.g., `./db/book` vs `../db/book`).
2. Omitting relative path prefixes (`./` or `../`), causing Node.js to look in `node_modules` instead of local project files.
3. Case-sensitivity issues (Windows file system is case-insensitive by default, but Linux production environments like Render are case-sensitive).
4. Forgetting to install the npm package before requiring it.

### How to Fix It

**Incorrect Code:**
```javascript
// Mistake 1: Trying to require local file without relative prefix
const db = require('book.db'); // Node searches node_modules/book.db -> MODULE_NOT_FOUND

// Mistake 2: Wrong relative path or incorrect extension/casing
const { open } = require('sqlite3/open'); // Wrong package export
```

**Correct Code:**
```javascript
// Correctly importing official installed packages:
const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// Correctly resolving relative local files using path.join and __dirname:
const dbPath = path.join(__dirname, 'book.db');
```

**Verification Checklist:**
- Verify dependencies exist in `package.json` under `"dependencies"`.
- Run `npm install` inside the project folder (`lab-03`).
- For local files, always prefix with `./` or `../` and match case exactly.

---

## 3. Error 3: Database Table or Path Error (`SQLITE_ERROR: no such table`)

### What It Means
SQLite produces `SQLITE_ERROR: no such table: book` when a query references a table name that does not exist in the connected database file.

### Symptom & Error Stack Trace
```text
DB Error: SQLITE_ERROR: no such table: book
Error: SQLITE_ERROR: no such table: book
    at Database.run (C:\Users\panta\...\node_modules\sqlite3\lib\sqlite3.js:33:14)
```

### Why It Happens
1. **Wrong Working Directory / Database Path:** Using a relative string like `'book.db'` causes SQLite to create a blank, new file wherever the terminal process was started from, rather than the folder where `server.js` resides.
2. **Typo in Table Name:** Querying `SELECT * FROM books;` (plural) when the table was created as `book` (singular).
3. **Uninitialized Schema:** The server attempted to query the database before the table creation DDL (`CREATE TABLE IF NOT EXISTS book ...`) completed.

### How to Fix It

**Incorrect Code:**
```javascript
// Relative path relies on process.cwd(), which fails if started from parent folder
const dbPath = 'book.db'; 

// Plural table name mismatch
const books = await db.all('SELECT * FROM books'); // Error: no such table: books
```

**Correct Code:**
```javascript
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

// 1. Always use absolute paths anchored to __dirname
const dbPath = path.join(__dirname, 'book.db');

// 2. Initialize connection and ensure table exists prior to handling requests
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Ensure schema is created before accepting traffic
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        price INTEGER,
        pages INTEGER
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
```

---

## 4. Error 4: Missing `await` in Asynchronous Database Calls

### What It Means
In modern Node.js SQLite drivers (such as the `sqlite` wrapper for `sqlite3`), database operations (`db.all()`, `db.get()`, `db.run()`, `db.exec()`) return a JavaScript `Promise`. If `await` is omitted, the variable receives an unresolved `Promise` object instead of the query result.

### Symptom & Unintended Behavior
- The API responds with `{}` or `{"message": "Books retrieved successfully", "data": {}}` because `res.json()` serializes a pending Promise into empty JSON.
- Conditions like `if (!book)` evaluate to `false` because an unresolved Promise object is truthy (`Promise { <pending> }` is truthy).
- The HTTP response may be sent before the database operation finishes, causing race conditions and unhandled rejection errors.

### Demonstration: Incorrect vs. Correct Code

#### Example A: GET Books (Returning Pending Promise)

**Incorrect Code (Missing `await`):**
```javascript
app.get('/books/', async (request, response) => {
  // BUG: db.all returns a Promise! Without await, books is Promise { <pending> }
  const books = db.all('SELECT * FROM book;');
  
  // books is sent as {} instead of an array of records
  response.status(200).json({
    message: 'Books retrieved successfully',
    data: books // Serializes to {}
  });
});
```

**Correct Code (With `await`):**
```javascript
app.get('/books/', async (request, response) => {
  try {
    // CORRECT: await unwraps the Promise to return the array of database rows
    const books = await db.all('SELECT * FROM book;');

    response.status(200).json({
      message: 'Books retrieved successfully',
      data: books // Correctly serializes to array of book objects
    });
  } catch (error) {
    response.status(500).json({ message: 'Internal server error' });
  }
});
```

#### Example B: GET Single Book (Truthy Promise Bug)

**Incorrect Code (Missing `await` leading to broken 404 check):**
```javascript
app.get('/books/:bookId/', async (request, response) => {
  const { bookId } = request.params;
  const book = db.get('SELECT * FROM book WHERE id = ?;', [bookId]);

  // BUG: book is Promise { <pending> }, which is ALWAYS truthy!
  // This 404 check NEVER triggers even for non-existent IDs:
  if (!book) {
    return response.status(404).json({ message: 'Book not found' });
  }

  // Client gets an empty JSON object instead of 404 Not Found
  response.status(200).json({ message: 'Book retrieved successfully', data: book });
});
```

**Correct Code (With `await`):**
```javascript
app.get('/books/:bookId/', async (request, response) => {
  try {
    const { bookId } = request.params;
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [bookId]);

    // Now correctly evaluates to undefined if no row matches
    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }

    response.status(200).json({
      message: 'Book retrieved successfully',
      data: book
    });
  } catch (error) {
    response.status(500).json({ message: 'Internal server error' });
  }
});
```

---

## Summary of Debugging Best Practices

| Issue | Quick Diagnosis | Prevention / Solution |
|---|---|---|
| **`EADDRINUSE`** | Server crashes on start: `listen EADDRINUSE :::3000` | Use `process.env.PORT \|\| 3000`; terminate stale process via `taskkill` or `npx kill-port`. |
| **`MODULE_NOT_FOUND`** | Server crashes on require: `Cannot find module ...` | Check path casing, add `./` for local files, ensure `npm install` was run in folder. |
| **`SQLITE_ERROR: no such table`** | SQL query throws table error | Anchor path with `path.join(__dirname, 'book.db')`; verify exact table name in schema. |
| **Missing `await`** | Response returns `{}` or 404 checks fail silently | Always use `await` with asynchronous DB calls inside `async` route handlers. |

