@echo off
REM Build script for frontend deployment on Windows

echo 🏗️  Starting frontend build process...

REM Check if we're in the correct directory
if not exist package.json (
    echo ❌ Error: package.json not found. Please run this script from the frontend directory.
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if installation was successful
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: npm install failed
    exit /b 1
)

REM Build the application
echo 🔨 Building the application...
call npm run build

REM Check if build was successful
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: npm run build failed
    exit /b 1
)

REM Check if dist directory was created
if not exist dist (
    echo ❌ Error: dist directory not created after build
    exit /b 1
)

echo ✅ Frontend build completed successfully!
echo 📁 Build output is available in the 'dist' directory
pause
