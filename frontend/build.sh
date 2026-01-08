#!/bin/bash

# Build script for frontend deployment
echo "🏗️  Starting frontend build process..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed"
    exit 1
fi

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Error: npm run build failed"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not created after build"
    exit 1
fi

echo "✅ Frontend build completed successfully!"
echo "📁 Build output is available in the 'dist' directory"
