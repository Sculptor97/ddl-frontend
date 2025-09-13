#!/bin/bash

# DDL Frontend Installation Script

echo "🚀 Installing DDL Frontend Dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# Development Configuration
VITE_APP_ENV=development
EOF
    echo "✅ .env file created. Please update VITE_MAPBOX_ACCESS_TOKEN with your Mapbox token."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Get a Mapbox access token from https://account.mapbox.com/access-tokens/"
echo "2. Update VITE_MAPBOX_ACCESS_TOKEN in .env file"
echo "3. Start the development server with: npm run dev"
echo ""
echo "For more information, see README.md"
