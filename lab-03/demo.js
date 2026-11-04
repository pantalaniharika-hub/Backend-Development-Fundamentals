/**
 * Demo Script to print all API outputs for Screenshots
 * Student: Niharika Pantala | Reg No: 252U1R3070 | Section: CSE-DS (2B)
 * Run command: node demo.js
 */

process.env.PORT = 3002; // Use test port to avoid conflict

const { Readable } = require('stream');
const EventEmitter = require('events');
const app = require('./server');

function request(method, url, body = null) {
  return new Promise((resolve) => {
    const req = new Readable();
    req._read = () => {};
    req.method = method;
    req.url = url;
    req.headers = { 'content-type': 'application/json' };

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
    res.writeHead = (status) => { res.statusCode = status; };

    let data = '';
    res.write = (chunk) => { if (chunk) data += chunk; };
    res.end = (chunk) => {
      if (chunk) data += chunk;
      let json = data;
      try { json = JSON.parse(data); } catch (e) {}
      resolve({ status: res.statusCode, body: json });
    };

    app(req, res);
  });
}

async function showAllOutputs() {
  await new Promise((r) => setTimeout(r, 600));

  const steps = [
    {
      title: '1. GET ALL BOOKS (save as: screenshots/get-all-books.png)',
      method: 'GET',
      url: '/books/'
    },
    {
      title: '2. SEARCH BOOKS BY TITLE (save as: screenshots/search-books.png)',
      method: 'GET',
      url: '/books/?search_q=Python'
    },
    {
      title: '3. SORT BY PRICE ASCENDING (save as: screenshots/sort-books.png)',
      method: 'GET',
      url: '/books/?order_by=price&order=ASC'
    },
    {
      title: '4. PAGINATION LIMIT=5 OFFSET=2 (save as: screenshots/pagination.png)',
      method: 'GET',
      url: '/books/?limit=5&offset=2'
    },
    {
      title: '5. PRICE FILTER 200 TO 700 (save as: screenshots/price-filter.png)',
      method: 'GET',
      url: '/books/?min_price=200&max_price=700'
    },
    {
      title: '6. POST A NEW BOOK (save as: screenshots/post-book.png)',
      method: 'POST',
      url: '/books/',
      body: {
        title: 'Full Stack Development',
        author: 'Niharika',
        price: 550,
        pages: 350
      }
    },
    {
      title: '7. PUT UPDATE BOOK ID 1 (save as: screenshots/put-book.png)',
      method: 'PUT',
      url: '/books/1/',
      body: {
        title: 'Clean Code (2nd Edition)',
        author: 'Robert C. Martin',
        price: 680,
        pages: 480
      }
    },
    {
      title: '8. DELETE BOOK ID 12 (save as: screenshots/delete-book.png)',
      method: 'DELETE',
      url: '/books/12/'
    },
    {
      title: '9. VALIDATION ERROR - MISSING TITLE (save as: screenshots/validation-error.png)',
      method: 'POST',
      url: '/books/',
      body: {
        author: 'Niharika',
        price: 500,
        pages: 200
      }
    },
    {
      title: '10. NOT FOUND - INVALID ID 99999 (save as: screenshots/not-found.png)',
      method: 'GET',
      url: '/books/99999/'
    }
  ];

  for (const step of steps) {
    console.log('\n================================================================================');
    console.log(`📌 ${step.title}`);
    console.log(`REQUEST: ${step.method} ${step.url}`);
    if (step.body) {
      console.log('PAYLOAD:', JSON.stringify(step.body, null, 2));
    }
    console.log('--------------------------------------------------------------------------------');
    const res = await request(step.method, step.url, step.body);
    console.log(`HTTP STATUS: ${res.status}`);
    console.log('RESPONSE BODY:');
    console.log(JSON.stringify(res.body, null, 2));
  }

  console.log('\n================================================================================');
  console.log('✅ ALL OUTPUTS GENERATED SUCCESSFULLY!');
  console.log('================================================================================\n');
  process.exit(0);
}

showAllOutputs();
