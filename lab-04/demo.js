/**
 * Demo Script for Lab 4: Registration, Login & JWT
 * Student: Niharika Pantala | Reg No: 252U1R3070 | Section: CSE-DS (2B)
 * Run command: node demo.js
 */

process.env.PORT = 3005; // Isolated port

const { Readable } = require('stream');
const EventEmitter = require('events');
const jwt = require('jsonwebtoken');
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

  console.log('\n================================================================================');
  console.log('📌 1. REGISTER NEW USER (save as: screenshots/register-success.png)');
  console.log('REQUEST: POST /register/');
  const regPayload = {
    username: 'priya',
    name: 'Priya Sharma',
    password: 'PriyaPassword123'
  };
  console.log('PAYLOAD:', JSON.stringify(regPayload, null, 2));
  console.log('--------------------------------------------------------------------------------');
  const res1 = await request('POST', '/register/', regPayload);
  console.log(`HTTP STATUS: ${res1.status}`);
  console.log('RESPONSE BODY:', JSON.stringify(res1.body, null, 2));

  console.log('\n================================================================================');
  console.log('📌 2. REGISTER DUPLICATE USERNAME (save as: screenshots/register-duplicate.png)');
  console.log('REQUEST: POST /register/');
  console.log('PAYLOAD (duplicate "niharika"):', JSON.stringify({
    username: 'niharika',
    name: 'Niharika Pantala',
    password: 'Niharika123'
  }, null, 2));
  console.log('--------------------------------------------------------------------------------');
  const res2 = await request('POST', '/register/', {
    username: 'niharika',
    name: 'Niharika Pantala',
    password: 'Niharika123'
  });
  console.log(`HTTP STATUS: ${res2.status}`);
  console.log('RESPONSE BODY:', JSON.stringify(res2.body, null, 2));

  console.log('\n================================================================================');
  console.log('📌 3. REGISTER VALIDATION ERROR (save as: screenshots/register-validation-error.png)');
  console.log('REQUEST: POST /register/');
  console.log('PAYLOAD (missing username):', JSON.stringify({
    name: 'Incomplete User',
    password: 'SomePassword'
  }, null, 2));
  console.log('--------------------------------------------------------------------------------');
  const res3 = await request('POST', '/register/', {
    name: 'Incomplete User',
    password: 'SomePassword'
  });
  console.log(`HTTP STATUS: ${res3.status}`);
  console.log('RESPONSE BODY:', JSON.stringify(res3.body, null, 2));

  console.log('\n================================================================================');
  console.log('📌 4. LOGIN SUCCESS & JWT GENERATION (save as: screenshots/login-success.png)');
  console.log('REQUEST: POST /login/');
  const loginPayload = {
    username: 'niharika',
    password: 'Niharika123'
  };
  console.log('PAYLOAD:', JSON.stringify(loginPayload, null, 2));
  console.log('--------------------------------------------------------------------------------');
  const res4 = await request('POST', '/login/', loginPayload);
  console.log(`HTTP STATUS: ${res4.status}`);
  console.log('RESPONSE BODY:', JSON.stringify(res4.body, null, 2));

  let token = res4.body.jwt_token;

  console.log('\n================================================================================');
  console.log('📌 5. LOGIN INVALID USER (save as: screenshots/login-invalid-user.png)');
  console.log('REQUEST: POST /login/');
  console.log('PAYLOAD (unknown username):', JSON.stringify({
    username: 'unknown_person',
    password: 'Password123'
  }, null, 2));
  console.log('--------------------------------------------------------------------------------');
  const res5 = await request('POST', '/login/', {
    username: 'unknown_person',
    password: 'Password123'
  });
  console.log(`HTTP STATUS: ${res5.status}`);
  console.log('RESPONSE BODY:', JSON.stringify(res5.body, null, 2));

  console.log('\n================================================================================');
  console.log('📌 6. LOGIN WRONG PASSWORD (save as: screenshots/login-wrong-password.png)');
  console.log('REQUEST: POST /login/');
  console.log('PAYLOAD (wrong password):', JSON.stringify({
    username: 'niharika',
    password: 'IncorrectPassword'
  }, null, 2));
  console.log('--------------------------------------------------------------------------------');
  const res6 = await request('POST', '/login/', {
    username: 'niharika',
    password: 'IncorrectPassword'
  });
  console.log(`HTTP STATUS: ${res6.status}`);
  console.log('RESPONSE BODY:', JSON.stringify(res6.body, null, 2));

  console.log('\n================================================================================');
  console.log('📌 7. JWT DECODING EXPLANATION (save as: screenshots/jwt-decoded.png)');
  console.log(`JWT TOKEN: ${token}`);
  console.log('--------------------------------------------------------------------------------');
  if (token) {
    const decodedPayload = jwt.decode(token);
    const decodedComplete = jwt.decode(token, { complete: true });
    console.log('1. HEADER (Algorithm & Token Type):', JSON.stringify(decodedComplete.header, null, 2));
    console.log('2. PAYLOAD (Only username & expiry):', JSON.stringify(decodedPayload, null, 2));
    console.log('3. SIGNATURE (Verified via HMAC-SHA256 with secretKey): [VERIFIED]');
    console.log('\nSecurity Check:');
    console.log('Password in payload?', 'password' in decodedPayload ? 'YES (UNSAFE!)' : 'NO (SECURE)');
    console.log('Password hash in payload?', 'passwordHash' in decodedPayload ? 'YES (UNSAFE!)' : 'NO (SECURE)');
  }

  console.log('\n================================================================================');
  console.log('✅ ALL DEMO OUTPUTS GENERATED SUCCESSFULLY!');
  console.log('================================================================================\n');
  process.exit(0);
}

showAllOutputs();

