# Vulnerable Web Application

A deliberately vulnerable web application designed for security scanning practice and penetration testing.

## ⚠️ WARNING

**This application contains intentional security vulnerabilities. DO NOT deploy this application in a production environment or expose it to the internet.**

## Purpose

This application is designed to:
- Practice security scanning with tools like OWASP ZAP, Burp Suite, or Nuclei
- Learn about common web vulnerabilities
- Test security scanning automation
- Understand vulnerability remediation

## Vulnerabilities Included

### 1. SQL Injection (SQLi)
- **Endpoints**: `/api/users`, `/api/login`
- **Description**: Direct string concatenation in SQL queries without parameterization
- **Example**: `GET /api/users?id=1 OR 1=1--`

### 2. Cross-Site Scripting (XSS)
- **Endpoints**: `/api/comment`, `/api/search`
- **Description**: No input sanitization, allowing script injection
- **Example**: `GET /api/comment?comment=<script>alert('XSS')</script>`

### 3. Path Traversal
- **Endpoint**: `/api/file`
- **Description**: No path validation, allowing access to arbitrary files
- **Example**: `GET /api/file?file=../../../etc/passwd`

### 4. Server-Side Request Forgery (SSRF)
- **Endpoints**: `/api/proxy`, `/api/fetch`
- **Description**: No URL validation, allowing internal network access
- **Example**: `GET /api/proxy?url=http://127.0.0.1:8080/internal`

### 5. Code Injection / Insecure Deserialization
- **Endpoints**: `/api/execute`, `/api/xml`
- **Description**: Dangerous use of `eval()` and XML parsing without restrictions
- **Example**: `POST /api/execute` with `{"code": "require('fs').readFileSync('/etc/passwd')"}`

### 6. Weak Authentication
- **Endpoint**: `/api/admin`
- **Description**: Simple password comparison, weak credentials
- **Example**: Password is hardcoded as `admin123`

### 7. Broken Authorization
- **Endpoint**: `/api/user/:id`
- **Description**: Missing proper JWT verification and authorization checks
- **Example**: Can access any user's data with any valid token

### 8. Insecure Direct Object Reference (IDOR)
- **Endpoint**: `/api/download/:filename`
- **Description**: No access control checks before file downloads
- **Example**: Can download any file by guessing the filename

### 9. Security Misconfiguration
- **Endpoint**: `/api/config`
- **Description**: Exposes sensitive configuration and credentials
- **Example**: Returns database passwords, API keys, JWT secrets

### 10. Insecure Dependencies
- **Description**: Uses outdated packages with known CVEs
- **Packages**: `axios@0.19.2`, `express@4.17.1`, `marked@0.8.2`, `jsonwebtoken@8.5.1`

### 11. Command Injection
- **Endpoint**: `/api/ping`
- **Description**: User input directly passed to system commands
- **Example**: `POST /api/ping` with `{"host": "8.8.8.8; cat /etc/passwd"}`

### 12. Open Redirect
- **Endpoint**: `/api/redirect`
- **Description**: No validation on redirect URLs
- **Example**: `GET /api/redirect?url=http://evil.com`

### 13. Information Disclosure
- **Endpoint**: `/api/debug`
- **Description**: Exposes internal system information
- **Example**: Returns Node.js version, environment variables, file paths

### 14. Missing Security Headers
- **Description**: No security headers like CSP, HSTS, X-Frame-Options

## Setup Instructions

1. **Install Node.js** (v14 or higher)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up MySQL database** (optional, for SQL injection testing):
   ```sql
   CREATE DATABASE vulnerable_db;
   CREATE TABLE users (
     id INT PRIMARY KEY,
     username VARCHAR(50),
     password VARCHAR(50),
     email VARCHAR(100)
   );
   INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin@example.com');
   ```

4. **Create required directories**:
   ```bash
   mkdir -p uploads files
   echo "Test file content" > files/test.txt
   echo "Another file" > uploads/upload.txt
   ```

5. **Run the application**:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

6. **Access the application**:
   - Open http://localhost:3000 in your browser

## Security Scanning Tools

This application can be tested with:
- **OWASP ZAP**: Automated security scanner
- **Burp Suite**: Professional penetration testing tool
- **Nuclei**: Fast vulnerability scanner
- **SQLMap**: SQL injection scanner
- **Nikto**: Web server scanner
- **npm audit**: Dependency vulnerability scanner

## Example Scan Commands

```bash
# OWASP ZAP
zap-cli quick-scan http://localhost:3000

# Nuclei
nuclei -u http://localhost:3000

# npm audit
npm audit

# SQLMap (SQL injection testing)
sqlmap -u "http://localhost:3000/api/users?id=1" --batch --dbs
```

## Legal Notice

This application is for educational and authorized security testing purposes only. Unauthorized access to computer systems is illegal. Only use this application on your own systems or with explicit written permission.

## License

MIT License - See LICENSE file for details

