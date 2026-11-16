/**
 * Automated Verification Script for Lab 4 API
 * Tests all Registration, Login, and JWT requirements
 * Student: Niharika Pantala | Reg No: 252U1R3070 | Section: CSE-DS (2B)
 */

process.env.PORT = 3004; // Use isolated port

const { Readable } = require('stream');
const EventEmitter = require('events');
const jwt = require('jsonwebtoken');
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
  console.log('STARTING LAB 4 AUTOMATED TESTS (REGISTRATION, LOGIN & JWT)');
  console.log('================================================================\n');

  const results = [];

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

  // --- REGISTRATION SUCCESS TESTS ---
  console.log('Running Registration Success Tests...');

  // Use a unique username for fresh registration test
  const testUser = `testuser_${Date.now()}`;
  await test(
    1,
    'Register new user with valid details',
    'POST',
    '/register/',
    {
      username: testUser,
      name: 'Test Student',
      password: 'Password123'
    },
    201,
    (b) => b.message === 'User registered successfully'
  );

  // --- REGISTRATION FAILURE TESTS ---
  console.log('Running Registration Failure Tests...');

  // 2. Register the same username again (duplicate)
  await test(
    2,
    'Reject duplicate username registration',
    'POST',
    '/register/',
    {
      username: testUser,
      name: 'Duplicate Student',
      password: 'AnotherPassword123'
    },
    400,
    (b) => b.message === 'User already exists'
  );

  // 3. Register without username
  await test(
    3,
    'Reject registration without username',
    'POST',
    '/register/',
    {
      name: 'Test User',
      password: 'Password123'
    },
    400,
    (b) => b.message === 'All fields are required'
  );

  // 4. Register without name
  await test(
    4,
    'Reject registration without name',
    'POST',
    '/register/',
    {
      username: 'noname_user',
      password: 'Password123'
    },
    400,
    (b) => b.message === 'All fields are required'
  );

  // 5. Register without password
  await test(
    5,
    'Reject registration without password',
    'POST',
    '/register/',
    {
      username: 'nopass_user',
      name: 'No Pass'
    },
    400,
    (b) => b.message === 'All fields are required'
  );

  // 6. Register with empty string values
  await test(
    6,
    'Reject registration with empty strings',
    'POST',
    '/register/',
    {
      username: '   ',
      name: '',
      password: '   '
    },
    400,
    (b) => b.message === 'All fields are required'
  );

  // --- LOGIN SUCCESS TESTS ---
  console.log('Running Login Success Tests...');

  let issuedToken = null;
  // 7. Login with correct username and password
  await test(
    7,
    'Login with correct credentials',
    'POST',
    '/login/',
    {
      username: testUser,
      password: 'Password123'
    },
    200,
    (b) => {
      if (b.jwt_token && typeof b.jwt_token === 'string') {
        issuedToken = b.jwt_token;
        return true;
      }
      return false;
    }
  );

  // 8. Verify JWT token structure & payload security
  let jwtValid = false;
  try {
    const decoded = jwt.decode(issuedToken);
    const hasUsername = decoded && decoded.username === testUser;
    const noPassword = decoded && !decoded.password && !decoded.passwordHash && !decoded.hash;
    const hasExpiry = decoded && decoded.exp !== undefined;
    jwtValid = hasUsername && noPassword && hasExpiry;
  } catch (e) {
    jwtValid = false;
  }

  results.push({
    Test: 8,
    Description: 'Verify JWT payload contains only username (no passwords)',
    Method: 'JWT_CHECK',
    Endpoint: 'TOKEN_PAYLOAD',
    Expected: 200,
    Actual: jwtValid ? 200 : 'FAIL',
    Passed: jwtValid ? 'PASS' : 'FAIL',
    ResponsePreview: jwtValid ? 'Valid JWT payload with username only' : 'Invalid JWT payload'
  });

  // --- LOGIN FAILURE TESTS ---
  console.log('Running Login Failure Tests...');

  // 9. Login with unknown username
  await test(
    9,
    'Reject login with unknown username',
    'POST',
    '/login/',
    {
      username: 'unknown_user_99999',
      password: 'Password123'
    },
    400,
    (b) => b.message === 'Invalid user'
  );

  // 10. Login with incorrect password
  await test(
    10,
    'Reject login with incorrect password',
    'POST',
    '/login/',
    {
      username: testUser,
      password: 'WrongPassword'
    },
    400,
    (b) => b.message === 'Invalid password'
  );

  // 11. Login without username
  await test(
    11,
    'Reject login without username',
    'POST',
    '/login/',
    {
      password: 'Password123'
    },
    400,
    (b) => b.message === 'All fields are required'
  );

  // 12. Login without password
  await test(
    12,
    'Reject login without password',
    'POST',
    '/login/',
    {
      username: testUser
    },
    400,
    (b) => b.message === 'All fields are required'
  );

  // 13. Unknown route
  await test(
    13,
    'Reject access to unknown route (404)',
    'GET',
    '/unknown-route/',
    null,
    404,
    (b) => b.message === 'Route not found'
  );

  console.log('\n================================================================');
  console.log('AUTOMATED TEST RESULTS (ALL TESTS):');
  console.log('================================================================');
  console.table(results, ['Test', 'Description', 'Method', 'Endpoint', 'Expected', 'Actual', 'Passed']);

  const failedCount = results.filter((r) => r.Passed !== 'PASS').length;
  if (failedCount === 0) {
    console.log('\n>>> SUCCESS: ALL LAB 4 TESTS PASSED! (100% PASS RATE) <<<\n');
    process.exit(0);
  } else {
    console.error(`\n>>> FAILURE: ${failedCount} test(s) failed. <<<\n`);
    process.exit(1);
  }
}

runAllTests();

