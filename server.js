const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const xml2js = require('xml2js');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const marked = require('marked');
const fs = require('fs');
const path = require('path');
const eval = require('eval');

const app = express();
const PORT = 3000;

// Hardcoded secrets (Vulnerability: Hardcoded Credentials)
const JWT_SECRET = 'my-super-secret-key-12345';
const ADMIN_PASSWORD = 'admin123';
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'root123';

// Vulnerable MySQL connection (Vulnerability: SQL Injection)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: DB_PASSWORD,
  database: 'vulnerable_db'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'session-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false }
}));

// Insecure CORS (Vulnerability: CORS Misconfiguration)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// VULNERABILITY 1: SQL Injection
app.get('/api/users', (req, res) => {
  const userId = req.query.id;
  // Direct string concatenation - vulnerable to SQL injection
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/api/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  // SQL Injection in login
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      const token = jwt.sign({ userId: results[0].id }, JWT_SECRET);
      res.json({ token, user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// VULNERABILITY 2: XSS (Cross-Site Scripting)
app.get('/api/comment', (req, res) => {
  const comment = req.query.comment;
  // No sanitization - vulnerable to XSS
  res.send(`<div>User comment: ${comment}</div>`);
});

app.post('/api/search', (req, res) => {
  const searchTerm = req.body.term;
  // Stored XSS vulnerability
  res.json({ 
    message: `Search results for: ${searchTerm}`,
    html: `<h2>Results for ${searchTerm}</h2>`
  });
});

// VULNERABILITY 3: Path Traversal
app.get('/api/file', (req, res) => {
  const filename = req.query.file;
  // No path validation - vulnerable to path traversal
  const filePath = path.join(__dirname, 'uploads', filename);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'File not found' });
    }
    res.send(data);
  });
});

// VULNERABILITY 4: SSRF (Server-Side Request Forgery)
app.get('/api/proxy', (req, res) => {
  const url = req.query.url;
  // No URL validation - vulnerable to SSRF
  axios.get(url)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/api/fetch', (req, res) => {
  const targetUrl = req.body.url;
  // SSRF with POST requests
  axios.post(targetUrl, req.body.data)
    .then(response => {
      res.json(response.data);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

// VULNERABILITY 5: Insecure Deserialization
app.post('/api/execute', (req, res) => {
  const code = req.body.code;
  // Dangerous eval usage - Code Injection
  try {
    const result = eval(code);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/xml', (req, res) => {
  const xmlData = req.body.xml;
  // XML External Entity (XXE) vulnerability
  xml2js.parseString(xmlData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

// VULNERABILITY 6: Weak Authentication
app.post('/api/admin', (req, res) => {
  const password = req.body.password;
  // Weak password comparison
  if (password === ADMIN_PASSWORD) {
    res.json({ message: 'Admin access granted', flag: 'FLAG{weak_auth_123}' });
  } else {
    res.status(401).json({ error: 'Access denied' });
  }
});

// VULNERABILITY 7: Broken Authorization
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  const token = req.headers.authorization;
  
  // No proper JWT verification
  try {
    const decoded = jwt.decode(token); // Should use jwt.verify()!
    if (decoded) {
      // Missing authorization check - any user can access any user's data
      const query = `SELECT * FROM users WHERE id = ${userId}`;
      db.query(query, (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(results[0]);
      });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// VULNERABILITY 8: Insecure Direct Object Reference
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  // No access control - can download any file
  const filePath = path.join(__dirname, 'files', filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// VULNERABILITY 9: Security Misconfiguration
app.get('/api/config', (req, res) => {
  // Exposing sensitive configuration
  res.json({
    database: {
      host: 'localhost',
      user: 'root',
      password: DB_PASSWORD,
      database: 'vulnerable_db'
    },
    jwt_secret: JWT_SECRET,
    api_key: API_KEY
  });
});

// VULNERABILITY 10: Insecure Dependencies
// Using old versions of dependencies with known vulnerabilities:
// - express 4.17.1 (older version)
// - axios 0.19.2 (has vulnerabilities)
// - marked 0.8.2 (older version)
// - jsonwebtoken 8.5.1 (older version)

// VULNERABILITY 11: Command Injection
app.post('/api/ping', (req, res) => {
  const host = req.body.host;
  // Command injection vulnerability
  const { exec } = require('child_process');
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.send(stdout);
  });
});

// VULNERABILITY 12: Unvalidated Redirects
app.get('/api/redirect', (req, res) => {
  const redirectUrl = req.query.url;
  // No validation - open redirect vulnerability
  res.redirect(redirectUrl);
});

// VULNERABILITY 13: Information Disclosure
app.get('/api/debug', (req, res) => {
  // Exposing stack traces and internal information
  res.json({
    node_version: process.version,
    platform: process.platform,
    env: process.env,
    cwd: process.cwd()
  });
});

// VULNERABILITY 14: Missing Security Headers
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vulnerable App</title>
    </head>
    <body>
      <h1>Vulnerable Web Application</h1>
      <p>This is a vulnerable application for security scanning practice.</p>
      <p>Check /api/ endpoints for various vulnerabilities.</p>
      <h2>Available Endpoints:</h2>
      <ul>
        <li>GET /api/users?id=1 - SQL Injection</li>
        <li>GET /api/comment?comment=test - XSS</li>
        <li>GET /api/file?file=test.txt - Path Traversal</li>
        <li>GET /api/proxy?url=http://example.com - SSRF</li>
        <li>POST /api/execute - Code Injection</li>
        <li>POST /api/admin - Weak Authentication</li>
        <li>GET /api/config - Information Disclosure</li>
        <li>POST /api/ping - Command Injection</li>
        <li>GET /api/redirect?url=http://example.com - Open Redirect</li>
      </ul>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Vulnerable app running on http://localhost:${PORT}`);
  console.log('WARNING: This application contains intentional vulnerabilities for security testing.');
});

