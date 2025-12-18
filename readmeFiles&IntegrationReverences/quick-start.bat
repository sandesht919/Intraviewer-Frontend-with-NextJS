@echo off
REM IntraViewer Frontend - Quick Start Script (Windows)
REM This script sets up and starts the development environment

echo.
echo 🚀 IntraViewer Frontend - Quick Start
echo =====================================
echo.

REM Check Node.js version
echo 📋 Checking Node.js version...
node -v
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Check for .env.local
echo 🔧 Checking environment configuration...
if not exist ".env.local" (
    echo ⚠️  .env.local not found. Creating template...
    (
        echo # IntraViewer Frontend Environment Variables
        echo.
        echo # Backend API URL (update to match your backend server^)
        echo NEXT_PUBLIC_API_URL=http://localhost:3001
        echo.
        echo # WebSocket Server URL (update to match your WebSocket server^)
        echo NEXT_PUBLIC_WS_URL=ws://localhost:8080
        echo.
        echo # Optional: Analytics or monitoring services
        echo # NEXT_PUBLIC_GA_ID=
        echo # NEXT_PUBLIC_SENTRY_DSN=
    ) > .env.local
    echo ✅ .env.local created with template values
    echo    ⚠️  Update NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL if needed
) else (
    echo ✅ .env.local already exists
)
echo.

REM Display project structure
echo 📚 Project Structure:
echo    - app/                    Next.js pages
echo    - lib/hooks/              Custom React hooks
echo    - components/ui/          Reusable UI components
echo    - public/                 Static assets
echo    - DEVELOPMENT_GUIDE.md    Detailed developer docs
echo    - API_INTEGRATION.md      Backend API specification
echo.

REM Start development server
echo 🎯 Starting development server...
echo    📖 Documentation:
echo       - Next.js: https://nextjs.org/docs
echo       - React: https://react.dev
echo       - Tailwind CSS: https://tailwindcss.com
echo.
echo 🌐 Available at: http://localhost:3000
echo 📱 Mobile preview: Responsive design included
echo.
echo 💡 Tips:
echo    - Press Ctrl+C to stop the server
echo    - Use 'npm run build' for production build
echo    - Check DEVELOPMENT_GUIDE.md for detailed documentation
echo.

call npm run dev
pause
