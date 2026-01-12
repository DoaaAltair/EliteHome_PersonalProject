@echo off
echo 🏠 Setting up EliteHome Property Management System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Backend setup
echo 📦 Setting up backend...
cd backend

REM Install backend dependencies
echo Installing backend dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy env.example .env
    echo ⚠️  Please edit backend\.env with your database credentials
)

echo ✅ Backend setup complete

REM Frontend setup
echo 📦 Setting up frontend...
cd ..\frontend

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install

echo ✅ Frontend setup complete

REM Database setup instructions
echo.
echo 🗄️  Database Setup Required:
echo 1. Create a MySQL database named 'elitehome'
echo 2. Run the SQL schema: mysql -u your_username -p elitehome ^< setup_database.sql
echo 3. Update backend\.env with your database credentials
echo 4. Test database: cd backend ^&^& node check_database.js
echo.

REM Start instructions
echo 🚀 To start the application:
echo.
echo Backend (Command Prompt 1):
echo   cd backend
echo   npm start
echo.
echo Frontend (Command Prompt 2):
echo   cd frontend
echo   npm start
echo.
echo Default admin login:
echo   Username: admin
echo   Password: admin123
echo.
echo ✅ Setup complete! Happy coding! 🎉
pause
