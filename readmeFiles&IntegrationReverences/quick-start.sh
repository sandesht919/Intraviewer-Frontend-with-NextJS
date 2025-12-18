#!/bin/bash

# IntraViewer Frontend - Quick Start Script
# This script sets up and starts the development environment

echo "🚀 IntraViewer Frontend - Quick Start"
echo "===================================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check for .env.local
echo "🔧 Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# IntraViewer Frontend Environment Variables

# Backend API URL (update to match your backend server)
NEXT_PUBLIC_API_URL=http://localhost:3001

# WebSocket Server URL (update to match your WebSocket server)
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Optional: Analytics or monitoring services
# NEXT_PUBLIC_GA_ID=
# NEXT_PUBLIC_SENTRY_DSN=
EOF
    echo "✅ .env.local created with template values"
    echo "   ⚠️  Update NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL if needed"
else
    echo "✅ .env.local already exists"
fi
echo ""

# Build information
echo "📚 Project Structure:"
echo "   - app/                    Next.js pages"
echo "   - lib/hooks/              Custom React hooks"
echo "   - components/ui/          Reusable UI components"
echo "   - public/                 Static assets"
echo "   - DEVELOPMENT_GUIDE.md    Detailed developer docs"
echo "   - API_INTEGRATION.md      Backend API specification"
echo ""

# Start development server
echo "🎯 Starting development server..."
echo "   📖 Documentation:"
echo "      - Next.js: https://nextjs.org/docs"
echo "      - React: https://react.dev"
echo "      - Tailwind CSS: https://tailwindcss.com"
echo ""
echo "🌐 Available at: http://localhost:3000"
echo "📱 Mobile preview: Responsive design included"
echo ""
echo "💡 Tips:"
echo "   - Press Ctrl+C to stop the server"
echo "   - Use 'npm run build' for production build"
echo "   - Check DEVELOPMENT_GUIDE.md for detailed documentation"
echo ""

npm run dev
