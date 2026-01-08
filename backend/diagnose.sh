#!/bin/bash

echo "🔍 Backend Diagnostic Script"
echo "=========================="

# Test backend health
echo "1. Testing backend health endpoint..."
BACKEND_URL="https://construction-site-api-8llr.onrender.com"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding correctly"
fi

echo ""
echo "2. Testing API endpoint..."
API_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}')
API_HTTP_CODE=$(echo "$API_RESPONSE" | tail -n1)
API_BODY=$(echo "$API_RESPONSE" | head -n -1)

echo "HTTP Status: $API_HTTP_CODE"
echo "Response: $API_BODY"

echo ""
echo "3. Testing database connection..."
DB_RESPONSE=$(curl -s "$BACKEND_URL")
echo "Root endpoint response shows database type: $(echo "$DB_RESPONSE" | grep -o '"database":"[^"]*"' || echo 'Not found')"
