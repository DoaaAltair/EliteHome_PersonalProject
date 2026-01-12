const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugLogin() {
    let connection;
    
    try {
        console.log('🔍 Debugging login for user "Kerem"...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'elitehome'
        });
        
        const [users] = await connection.execute(
            "SELECT id, username, password, role, is_blocked FROM users WHERE username = ?",
            ['Kerem']
        );
        
        if (users.length === 0) {
            console.log('❌ User "Kerem" not found in database');
            return;
        }
        
        const user = users[0];
        console.log('✅ User found:', {
            id: user.id,
            username: user.username,
            role: user.role,
            is_blocked: user.is_blocked,
            password_hash: user.password.substring(0, 20) + '...'
        });
        
        if (user.is_blocked) {
            console.log('🚫 User is blocked');
            return;
        }
        
        console.log('✅ User is not blocked');
        
        const bcrypt = require('bcrypt');
        const testPassword = 'admin123'; // Try common passwords
        
        console.log('🔐 Testing password comparison...');
        const match = await bcrypt.compare(testPassword, user.password);
        console.log('Password match result:', match);
        
        if (!match) {
            console.log('❌ Password does not match');
            console.log('💡 The password in the database might be different from what you expect');
            console.log('💡 Try creating a new user or resetting the password');
        } else {
            console.log('✅ Password matches!');
        }
        
    } catch (err) {
        console.error('❌ Debug error:', err.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

debugLogin();
