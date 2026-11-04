/**
 * Automated Verification Script for Lab 3 API
 * Tests all 22 test cases (11 success + 11 failure) against the Express application
 * Student: Niharika Pantala | Reg No: 252U1R3070 | Section: CSE-DS (2B)
 */

process.env.PORT = 3003; // Avoid port collision with running server

const { Readable } = require('stream');
const EventEmitter = require('events');
const app = require('./server');

function executeRequest(method, url, body = null) {
  return new Promise((resolve) => {
    const req = new Readable();
    req._read = () => {};
    req.method = method;
    req.url = url;
    req.headers = {
      'content-type': 'application/json'
    };

    if (body !== null) {
      const bodyStr = JSON.stringify(body);
      req.headers['content-length'] = Buffer.byteLength(bodyStr);
      req.push(bodyStr);
    }
    req.push(null);

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    res.writeHead = (status, headers = {}) => {
      res.statusCode = status;
      for (const [k, v] of Object.entries(headers)) {
        res.setHeader(k, v);
      }
    };

    let rawBody = '';
    res.write = (chunk) => {
      if (chunk) rawBody += chunk;
    };
    res.end = (chunk) => {
      if (chunk) rawBody += chunk;
      let parsed = null;
      try {
        parsed = JSON.parse(rawBody);
      } catch (e) {
        parsed = rawBody;
      }
      resolve({
        status: res.statusCode,
        body: parsed
      });
    };

    app(req, res);
  });
}

async function runAllTests() {
  console.log('Waiting 800ms for database connection...');
  await new Promise((r) => setTimeout(r, 800));

  console.log('\n================================================================');
  console.log('STARTING LAB 3 AUTOMATED TESTS (22 TEST CASES)');
  console.log('================================================================\n');

  const results = [];
  let createdBookId = null;

  async function test(id, description, method, path, body, expectedStatus, validator) {
    const res = await executeRequest(method, path, body);
    const statusMatch = res.status === expectedStatus;
    const bodyValid = !validator || validator(res.body);
    const passed = statusMatch && bodyValid;

    results.push({
      Test: id,
      Description: description,
      Method: method,
      Endpoint: path,
      Expected: expectedStatus,
      Actual: res.status,
      Passed: passed ? 'PASS' : 'FAIL',
      ResponsePreview: JSON.stringify(res.body).substring(0, 50) + '...'
    });

    return { res, passed };
  }

  // --- SUCCESS TEST CASES (1-11) ---
  console.log('Running 11 Successful Test Cases...');

  // 1. GET all books
  await test(1, 'GET all books', 'GET', '/books/', null, 200, (b) => {
    return b.message === 'Books retrieved successfully' && Array.isArray(b.data) && b.data.length > 0;
  });

  // 2. GET a specific book
  await test(2, 'GET a specific book', 'GET', '/books/1/', null, 200, (b) => {
    return b.message === 'Book retrieved successfully' && b.data && b.data.id === 1;
  });

  // 3. Search books by partial title
  await test(3, 'Search books by partial title', 'GET', '/books/?search_q=Python', null, 200, (b) => {
    return b.data.length >= 2 && b.data.every((book) => book.title.toLowerCase().includes('python'));
  });

  // 4. Sort by price ascending
  await test(4, 'Sort by price ascending', 'GET', '/books/?order_by=price&order=ASC', null, 200, (b) => {
    return b.data.length > 1 && b.data[0].price <= b.data[1].price;
  });

  // 5. Sort by price descending
  await test(5, 'Sort by price descending', 'GET', '/books/?order_by=price&order=DESC', null, 200, (b) => {
    return b.data.length > 1 && b.data[0].price >= b.data[1].price;
  });

  // 6. Pagination using limit and offset
  await test(6, 'Pagination (limit=3, offset=2)', 'GET', '/books/?limit=3&offset=2', null, 200, (b) => {
    return b.data.length === 3;
  });

  // 7. Minimum and maximum price filtering
  await test(7, 'Min and max price filtering (400-700)', 'GET', '/books/?min_price=400&max_price=700', null, 200, (b) => {
    return b.data.length > 0 && b.data.every((bk) => bk.price >= 400 && bk.price <= 700);
  });

  // 8. Combined search, sorting, pagination, and price filtering
  await test(
    8,
    'Combined query parameters',
    'GET',
    '/books/?search_q=Python&order_by=price&order=DESC&limit=5&offset=0&min_price=200&max_price=700',
    null,
    200,
    (b) => {
      return (
        b.data.length >= 1 &&
        b.data.every((bk) => bk.title.toLowerCase().includes('python') && bk.price >= 200 && bk.price <= 700)
      );
    }
  );

  // 9. POST a new book
  await test(
    9,
    'POST a new book',
    'POST',
    '/books/',
    {
      title: 'Full Stack Development',
      author: 'Niharika',
      price: 550,
      pages: 350
    },
    201,
    (b) => {
      if (b.message === 'Book created successfully' && b.bookId > 0) {
        createdBookId = b.bookId;
        return true;
      }
      return false;
    }
  );

  // 10. PUT an existing book
  const bookToUpdate = createdBookId || 1;
  await test(
    10,
    'PUT update an existing book',
    'PUT',
    `/books/${bookToUpdate}/`,
    {
      title: 'Full Stack Development (2nd Edition)',
      author: 'Niharika Pantala',
      price: 600,
      pages: 380
    },
    200,
    (b) => b.message === 'Book updated successfully'
  );

  // 11. DELETE an existing book
  await test(
    11,
    'DELETE an existing book',
    'DELETE',
    `/books/${bookToUpdate}/`,
    null,
    200,
    (b) => b.message === 'Book deleted successfully'
  );

  // --- FAILURE TEST CASES (12-22) ---
  console.log('Running 11 Failure Test Cases...');

  // 12. GET an invalid book ID
  await test(12, 'GET invalid book ID (string)', 'GET', '/books/abc/', null, 400, (b) => {
    return b.message === 'Invalid book ID';
  });

  // 13. POST without title
  await test(
    13,
    'POST without title',
    'POST',
    '/books/',
    {
      author: 'Niharika',
      price: 500,
      pages: 200
    },
    400,
    (b) => b.message === 'Title is required'
  );

  // 14. POST without author
  await test(
    14,
    'POST without author',
    'POST',
    '/books/',
    {
      title: 'No Author Book',
      price: 500,
      pages: 200
    },
    400,
    (b) => b.message === 'Author is required'
  );

  // 15. POST with non-numeric price
  await test(
    15,
    'POST with non-numeric price',
    'POST',
    '/books/',
    {
      title: 'Web Security',
      author: 'Niharika',
      price: 'five hundred',
      pages: 200
    },
    400,
    (b) => b.message === 'Price must be a number'
  );

  // 16. POST with negative price
  await test(
    16,
    'POST with negative price',
    'POST',
    '/books/',
    {
      title: 'Web Security',
      author: 'Niharika',
      price: -50,
      pages: 200
    },
    400,
    (b) => b.message === 'Price cannot be negative'
  );

  // 17. GET with invalid order
  await test(17, 'GET with invalid order', 'GET', '/books/?order=INVALID_DIR', null, 400, (b) => {
    return b.message.includes('Invalid order direction');
  });

  // 18. GET with invalid order_by
  await test(18, 'GET with invalid order_by', 'GET', '/books/?order_by=publisher', null, 400, (b) => {
    return b.message.includes('Invalid order_by column');
  });

  // 19. GET with negative limit
  await test(19, 'GET with negative limit', 'GET', '/books/?limit=-5', null, 400, (b) => {
    return b.message === 'Limit must be a positive integer';
  });

  // 20. GET with invalid offset
  await test(20, 'GET with negative offset', 'GET', '/books/?offset=-3', null, 400, (b) => {
    return b.message === 'Offset must be a non-negative integer';
  });

  // 21. GET with min_price greater than max_price
  await test(21, 'GET with min_price > max_price', 'GET', '/books/?min_price=800&max_price=200', null, 400, (b) => {
    return b.message === 'Minimum price cannot be greater than maximum price';
  });

  // 22. Access an unknown API route
  await test(22, 'Access unknown API route', 'GET', '/unknown-route/', null, 404, (b) => {
    return b.message === 'Route not found';
  });

  console.log('\n================================================================');
  console.log('AUTOMATED TEST RESULTS (ALL 22 TESTS):');
  console.log('================================================================');
  console.table(results, ['Test', 'Description', 'Method', 'Endpoint', 'Expected', 'Actual', 'Passed']);

  const failedCount = results.filter((r) => r.Passed !== 'PASS').length;
  if (failedCount === 0) {
    console.log('\n>>> SUCCESS: ALL 22 TEST CASES PASSED! (100% PASS RATE) <<<\n');
    process.exit(0);
  } else {
    console.error(`\n>>> FAILURE: ${failedCount} test(s) failed. <<<\n`);
    process.exit(1);
  }
}

runAllTests();
