#!/bin/bash

# EliteHome Setup Script
echo "🏠 Setting up EliteHome Property Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "⚠️  Please edit backend/.env with your database credentials"
fi

echo "✅ Backend setup complete"

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete"

# Database setup instructions
echo ""
echo "🗄️  Database Setup Required:"
echo "1. Create a MySQL database named 'elitehome'"
echo "2. Run the SQL schema: mysql -u your_username -p elitehome < setup_database.sql"
echo "3. Update backend/.env with your database credentials"
echo "4. Test database: cd backend && node check_database.js"
echo ""

# Start instructions
echo "🚀 To start the application:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  npm start"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Default admin login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "✅ Setup complete! Happy coding! 🎉"
