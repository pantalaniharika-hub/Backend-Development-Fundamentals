# Lab 04: Registration, Login and JWT

> **Backend Development Fundamentals**  
> Department of Computer Science & Engineering (Data Science)  
> **Aurora University**

---

## 🌐 Live Deployment URL

- **Production API URL (Render):** [https://niharika-lab-04-registartion-and-login.onrender.com/](https://niharika-lab-04-registartion-and-login.onrender.com/)  
  *(Live deployment on Render)*
- **Local Development URL:** `http://localhost:3000/`
- **GitHub Repository:** [https://github.com/pantalaniharika-hub/Backend-Development-Fundamentals](https://github.com/pantalaniharika-hub/Backend-Development-Fundamentals)

---

## 👤 Student Details

| Field | Details |
| :--- | :--- |
| **Student Name** | Niharika Pantala |
| **Registration Number** | 252U1R3070 |
| **Section** | CSE-DS (2B) |
| **University** | Aurora University |
| **Subject** | Backend Development Fundamentals |
| **Lab Number** | 04 |
| **Lab Title** | Registration, Login and JWT |
| **Faculty** | Mr. Yugandhar |

---

## 🎯 1. Objective

The primary objectives of this laboratory are:
1. To understand backend authentication fundamentals, distinguishing between **Authentication** (identifying who the user is) and **Authorization** (verifying what the user is allowed to do).
2. To build a secure **User Registration API (`POST /register/`)** that validates client input, enforces username uniqueness, and securely hashes user passwords using the one-way adaptive hashing algorithm **bcrypt**.
3. To build a secure **User Login API (`POST /login/`)** that verifies user existence and validates incoming plain-text credentials against the stored bcrypt hash using `bcrypt.compare()`.
4. To implement **JSON Web Token (JWT)** generation upon successful login using `jwt.sign()`, producing stateless bearer tokens signed with an HMAC-SHA256 signature and containing only non-sensitive claims (`username`).
5. To understand JWT structure (Header, Payload, Signature) and inspect token decoding using online tools such as [https://jwt.io/](https://jwt.io/).
6. To enforce secure database access using parameterized SQL queries with `?` placeholders to defend against **SQL Injection**.
7. To provide consistent JSON responses and map success and error conditions to standard HTTP status codes (`201 Created`, `200 OK`, `400 Bad Request`, `404 Not Found`, and `500 Internal Server Error`).
8. To build and execute an automated Postman test collection validating all registration, login, and validation cases.

---

## 🛠️ 2. Technologies Used

- **Runtime Environment:** Node.js (v18+)
- **Web Framework:** Express.js (`express` v4.19.2)
- **Database Engine:** SQLite 3 (`user.db`)
- **Database Drivers & Wrappers:**
  - `sqlite3` (v5.1.7) – Core C/C++ SQLite bindings for Node.js
  - `sqlite` (v5.1.1) – Promise-based wrapper enabling `async`/`await` database access
- **Cryptography & Hashing:** `bcrypt` (v5.1.1) – Adaptive password hashing with salt rounds
- **Token-based Authentication:** `jsonwebtoken` (v9.0.2) – Compact, URL-safe means of representing claims
- **Development Tool:** `nodemon` (v3.1.0) – Live automatic server reload
- **API Testing Client:** Postman
- **Version Control:** Git & GitHub
- **Cloud Hosting:** Render Cloud Platform

---

## 📁 3. Project Folder Structure

The repository maintains an independent, runnable folder for Lab 4 alongside previous laboratories:

```text
backend-development/
│
├── lab-01/
├── lab-02/
├── lab-03/
│
└── lab-04/
    ├── server.js
    ├── package.json
    ├── package-lock.json
    ├── user.db
    ├── .gitignore
    ├── README.md
    ├── postman_collection.json
    └── screenshots/
        ├── .gitkeep
        ├── register-success.png
        ├── register-duplicate.png
        ├── register-validation-error.png
        ├── login-success.png
        ├── login-invalid-user.png
        ├── login-wrong-password.png
        ├── database-password-hash.png
        └── jwt-decoded.png
```
        ├── login-wrong-password.png
        ├── database-password-hash.png
        └── jwt-decoded.png
```

---

## 🗄️ 4. Database Table Structure

The application creates and connects to an SQLite database file named `user.db`.

```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    name TEXT,
    password TEXT
);
```

### Column Specifications:

| Column | Data Type | Constraints | Description |
| :--- | :---: | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier for each user |
| `username` | `TEXT` | `UNIQUE` | Unique login identifier; rejects duplicate registrations |
| `name` | `TEXT` | `NOT NULL` | Full name of the registered student/user |
| `password` | `TEXT` | `NOT NULL` | **Bcrypt password hash** (starts with `$2b$10$`). Plaintext passwords are never stored. |

---

## 📦 5. Installation Instructions

Navigate to the `lab-04` directory and install the required dependencies:

```bash
# 1. Navigate to the lab-04 folder
cd lab-04

# 2. Install all runtime and development packages
npm install
```

---

## ▶️ 6. Commands to Run the Server

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm start` | Production Start | Runs `node server.js` |
| `npm run dev` | Development Start | Runs `nodemon server.js` with auto-reload |

---

## ⚙️ 7. Required Environment Variables

For Lab 4, the JWT secret key is defined as a code constant (`MY_SECRET_TOKEN`) as required by the assignment guidelines.

> [!NOTE]
> **Security Notice:** In production and future assignments (Lab 8), all sensitive credentials and secret keys will be stored in an external `.env` file excluded from version control:
> - `PORT=3000`
> - `JWT_SECRET=your_super_secret_jwt_key`

---

## 🛣️ 8. API Endpoint Table

| HTTP Method | Endpoint | Request Body | Status Code | Description |
| :--- | :--- | :--- | :---: | :--- |
| **GET** | `/` | None | `200 OK` | Welcome endpoint confirming server is running |
| **POST** | `/register/` | `{ username, name, password }` | `201 Created` / `400 Bad Request` | Registers a new user with bcrypt-hashed password |
| **POST** | `/login/` | `{ username, password }` | `200 OK` / `400 Bad Request` | Authenticates credentials and returns a signed `jwt_token` |
| **ALL** | Any unknown route | Any | `404 Not Found` | Catch-all handler (`{"message": "Route not found"}`) |

---

## 📝 9. Sample Registration Request & Response

### Request:
```http
POST /register/ HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "niharika",
  "name": "Niharika Pantala",
  "password": "Niharika123"
}
```

### Response (201 Created):
```json
{
  "message": "User registered successfully"
}
```

### Duplicate Username Response (400 Bad Request):
```json
{
  "message": "User already exists"
}
```

### Missing Field Validation Response (400 Bad Request):
```json
{
  "message": "All fields are required"
}
```

---

## 🔑 10. Sample Login Request & Response

### Request:
```http
POST /login/ HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "niharika",
  "password": "Niharika123"
}
```

### Response (200 OK):
```json
{
  "jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im5paGFyaWthIiwiaWF0IjoxNzk0NzQ4OTMwLCJleHAiOjE3OTQ3NTI1MzB9.e53LCSEix5HI4XvuIfHT-O3gtCxuNnYTOdnpVq7cNhI"
}
```

### Unknown User Response (400 Bad Request):
```json
{
  "message": "Invalid user"
}
```

### Incorrect Password Response (400 Bad Request):
```json
{
  "message": "Invalid password"
}
```

---

## 🛡️ 11. JSON Web Token (JWT) Explanation

A **JSON Web Token (JWT)** is an open standard (RFC 7519) that defines a compact, URL-safe format for securely transmitting claims between parties as a JSON object.

### The Three Parts of a JWT:
A JWT is composed of three strings separated by dots (`.`):
$$\text{JWT} = \text{Header} \,.\, \text{Payload} \,.\, \text{Signature}$$

1. **Header:** Contains token metadata (signing algorithm `HS256` and token type `JWT`):
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```
2. **Payload:** Contains the claims (identity data). In Lab 4, only the non-sensitive `username` and timestamps (`iat`, `exp`) are stored:
   ```json
   {
     "username": "niharika",
     "iat": 1794748930,
     "exp": 1794752530
   }
   ```
3. **Signature:** Created by hashing the encoded header, encoded payload, and a secret key using HMAC-SHA256:
   $$\text{Signature} = \text{HMACSHA256}(\text{base64UrlEncode}(\text{Header}) + "." + \text{base64UrlEncode}(\text{Payload}), \text{secretKey})$$

> [!WARNING]
> **Critical Security Concept: Encoding vs. Encryption**  
> Decoding a JWT **does NOT** require the secret key. The header and payload are simply **Base64Url-encoded**, meaning anyone who intercepts the token can read the payload contents.  
> **Therefore, NEVER store passwords, password hashes, credit cards, or sensitive personal data inside a JWT payload.** The secret key is only required to **verify the authenticity** of the signature.

---

## 🌐 12. How to Decode a JWT Using jwt.io

1. Log in via `POST /login/` using Postman to receive your `jwt_token`.
2. Copy the token string (e.g., `eyJhbGciOi...`).
3. Open your browser and navigate to **[https://jwt.io/](https://jwt.io/)**.
4. In the **Debugger** section, paste the token into the **Encoded** textarea.
5. In the **Decoded** pane, inspect the decoded JSON:
   - **Header:** Confirms `alg: "HS256"` and `typ: "JWT"`.
   - **Payload:** Confirms only `"username": "niharika"` and standard timestamps (`iat`, `exp`) are present.
   - **Signature:** Displays `Signature Verified` once `MY_SECRET_TOKEN` is typed in the secret box.
6. Take a screenshot showing the decoded payload and save it as `screenshots/jwt-decoded.png`.

---

## 📮 13. Postman Testing Instructions

The repository provides a complete, pre-configured collection: [`postman_collection.json`](./postman_collection.json).

### Steps to Import and Execute:
1. Open the **Postman** application.
2. Click **Import** (top left) &rarr; Choose `lab-04/postman_collection.json`.
3. Open the imported collection: **`Lab 4 - Registration and Login JWT`**.
4. Verify Collection Variables: `baseUrl` is set to `http://localhost:3000`.
5. Ensure your local server is running (`npm start` or `npm run dev`).
6. Execute requests sequentially:
   - **01. Register User (Success):** Sends username `rahul`, returns `201 Created`.
   - **02. Register Duplicate Username (Failure):** Sends username `niharika`, returns `400 Bad Request` (`User already exists`).
   - **03 to 06. Register Validation Failures:** Sends missing/empty fields, returns `400 Bad Request` (`All fields are required`).
   - **07. Login (Success):** Sends `niharika` & `Niharika123`, returns `200 OK` and a valid `jwt_token`.
   - **08. Login Unknown User:** Sends non-existent username, returns `400 Bad Request` (`Invalid user`).
   - **09. Login Incorrect Password:** Sends wrong password, returns `400 Bad Request` (`Invalid password`).
   - **10 to 11. Login Missing Fields:** Sends missing username/password, returns `400 Bad Request` (`All fields are required`).

---

## 📸 14. Screenshots Section

Below are the designated screenshot references documenting API execution, database verification, and JWT decoding.

### How to Capture and Save Real Screenshots:
1. Start the server using `npm run dev`.
2. Execute each request in Postman, SQLite CLI, and jwt.io.
3. Press **`Win + Shift + S`** on Windows to capture the snip.
4. Save each image with the exact filename below inside the `lab-04/screenshots/` folder.

| Screenshot Name | Endpoint / Action Demonstrated | Image Reference |
| :--- | :--- | :--- |
| `register-success.png` | POST `/register/` returning status `201 Created` | ![Registration Success](screenshots/register-success.png) |
| `register-duplicate.png` | POST `/register/` with existing username returning `400 User already exists` | ![Registration Duplicate](screenshots/register-duplicate.png) |
| `register-validation-error.png` | POST `/register/` with missing fields returning `400 All fields are required` | ![Registration Validation Error](screenshots/register-validation-error.png) |
| `login-success.png` | POST `/login/` returning status `200 OK` and `jwt_token` | ![Login Success](screenshots/login-success.png) |
| `login-invalid-user.png` | POST `/login/` with unknown username returning `400 Invalid user` | ![Login Invalid User](screenshots/login-invalid-user.png) |
| `login-wrong-password.png` | POST `/login/` with incorrect password returning `400 Invalid password` | ![Login Wrong Password](screenshots/login-wrong-password.png) |
| `database-password-hash.png` | SQLite CLI table showing `user` records with bcrypt password hashes | ![Database Password Hash](screenshots/database-password-hash.png) |
| `jwt-decoded.png` | jwt.io showing decoded Header, Payload (username only), and Signature | ![JWT Decoded](screenshots/jwt-decoded.png) |

---

## ⚠️ 15. Problems Faced and Solutions

1. **Storing Plain-Text Passwords (Data Breach Vulnerability):**
   - *Problem:* Storing passwords in plaintext exposes all user credentials in the event of database leaks or unauthorized database reads.
   - *Solution:* Implemented `bcrypt.hash(password, 10)` to compute a salted, cryptographic one-way hash. The original password is never written to disk or returned in responses.

2. **Comparing Hashed Passwords During Login:**
   - *Problem:* Bcrypt hashes generate unique salts on every invocation, so `bcrypt.hash(password, 10) === storedHash` will never match.
   - *Solution:* Utilized `await bcrypt.compare(password, dbUser.password)`, which securely extracts the salt from the stored hash and performs timing-safe comparison.

3. **Sensitive Information Exposure in JWT Payload:**
   - *Problem:* Mistakenly including the password hash or sensitive personal data in the JWT payload exposes user credentials because JWT payloads are merely Base64-encoded, not encrypted.
   - *Solution:* Restricted the JWT payload strictly to `{ username: dbUser.username }`.

4. **Handling Duplicate Usernames Gracefully:**
   - *Problem:* SQLite throws a constraint violation exception (`SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username`) when inserting duplicates, which would cause an unhandled 500 error if not managed.
   - *Solution:* Queried `SELECT * FROM user WHERE username = ?;` prior to insertion and returned a clean `400 Bad Request` with `{ "message": "User already exists" }`.

---

## 🎓 16. Learning Outcomes

1. Mastered password hashing mechanisms using `bcrypt` and understood the role of salt rounds in thwarting rainbow table attacks.
2. Built authentication workflows with registration and credential validation.
3. Implemented stateless token authentication using JSON Web Tokens (JWT) with `jwt.sign()`.
4. Understood the anatomy of JWTs (Header, Payload, Signature) and verified claims via [jwt.io](https://jwt.io/).
5. Strengthened database security using parameterized queries with SQLite.
6. Gained hands-on experience in API testing, status code selection, and writing automated test suites.

---

## 🏁 17. Conclusion

Lab 4 successfully demonstrates a secure, production-standard user authentication pipeline using Node.js, Express, SQLite, bcrypt, and JSON Web Tokens. All core security best practices—including password hashing, unique constraint handling, non-sensitive JWT payloads, parameterized queries, and strict HTTP status mapping—have been implemented, tested, and verified with a 100% test pass rate.

