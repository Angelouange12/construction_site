@echo off
echo 🔍 Backend Diagnostic Script
echo ==========================

set BACKEND_URL=https://construction-site-api-8llr.onrender.com

echo 1. Testing backend health endpoint...
curl -s -w "%%{http_code}" "%BACKEND_URL%/health" > temp_response.txt
set /p HTTP_CODE=<temp_response.txt
set /p RESPONSE_BODY=<temp_response.txt

echo HTTP Status: %HTTP_CODE%
echo Response: %RESPONSE_BODY%

if "%HTTP_CODE%"=="200" (
    echo ✅ Backend is responding
) else (
    echo ❌ Backend is not responding correctly
)

echo.
echo 2. Testing API endpoint...
curl -s -w "%%{http_code}" "%BACKEND_URL%/api/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test\"}" > temp_api_response.txt
set /p API_HTTP_CODE=<temp_api_response.txt
set /p API_BODY=<temp_api_response.txt

echo HTTP Status: %API_HTTP_CODE%
echo Response: %API_BODY%

echo.
echo 3. Checking root endpoint...
curl -s "%BACKEND_URL%" > temp_root_response.txt
type temp_root_response.txt

del temp_response.txt temp_api_response.txt temp_root_response.txt 2>nul
pause
