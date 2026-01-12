// Database Check Script for EliteHome
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    let connection;
    
    try {
        console.log('🔍 Checking database connection...');
        
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'elitehome'
        });
        
        console.log('✅ Database connection successful');
        
        // Check if tables exist
        const [tables] = await connection.execute("SHOW TABLES");
        console.log('📋 Existing tables:', tables.map(t => Object.values(t)[0]));
        
        // Check notifications table structure
        try {
            const [columns] = await connection.execute("DESCRIBE notifications");
            console.log('📝 Notifications table columns:', columns.map(c => c.Field));
        } catch (err) {
            console.log('❌ Notifications table does not exist or has issues');
            console.log('💡 Run: mysql -u your_username -p elitehome < setup_database.sql');
        }
        
        // Check users table
        try {
            const [users] = await connection.execute("SELECT COUNT(*) as count FROM users");
            console.log('👥 Users in database:', users[0].count);
        } catch (err) {
            console.log('❌ Users table does not exist');
        }
        
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        console.log('\n💡 Setup instructions:');
        console.log('1. Create database: CREATE DATABASE elitehome;');
        console.log('2. Run schema: mysql -u your_username -p elitehome < setup_database.sql');
        console.log('3. Update backend/.env with your database credentials');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDatabase();
