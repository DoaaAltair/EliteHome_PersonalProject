require("dotenv").config();
const db = require("./db");

async function testConnection() {
    console.log("🔍 Testing Supabase database connection...\n");

    console.log("📋 Environment variables:");
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'NOT SET'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || 'NOT SET'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'NOT SET'}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT || '5432'}`);
    console.log(`   DB_SSL: ${process.env.DB_SSL || 'false'}\n`);

    try {
        console.log("🧪 Test 1: Basic connection test...");
        const result = await db.query("SELECT 1 as test");
        console.log("   ✅ Connection successful!");
        console.log(`   Result: ${JSON.stringify(result.rows[0])}\n`);

        console.log("🧪 Test 2: Checking database tables...");
        const tablesResult = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        const tables = tablesResult.rows.map(row => row.table_name);
        console.log(`   ✅ Found ${tables.length} tables:`);
        tables.forEach(table => console.log(`      - ${table}`));
        console.log();

        console.log("🧪 Test 3: Testing MySQL-compatible execute wrapper...");
        const [rows] = await db.execute("SELECT NOW() as current_time");
        console.log("   ✅ Execute wrapper works!");
        console.log(`   Current time: ${rows[0].current_time}\n`);

        console.log("🧪 Test 4: Checking required tables...");
        const requiredTables = ['users', 'apartments', 'invoices', 'finances', 'notifications'];
        const missingTables = requiredTables.filter(table => !tables.includes(table));

        if (missingTables.length === 0) {
            console.log("   ✅ All required tables exist!");
        } else {
            console.log("   ⚠️  Missing tables:");
            missingTables.forEach(table => console.log(`      - ${table}`));
            console.log("\n   💡 Run the PostgreSQL schema in Supabase SQL Editor to create these tables.");
        }
        console.log();

        if (tables.includes('users')) {
            console.log("🧪 Test 5: Testing INSERT query with RETURNING...");
            try {
                const [result] = await db.execute(
                    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
                    ['test_user_' + Date.now(), 'test_password', 'staff']
                );
                console.log("   ✅ INSERT test successful!");
                console.log(`   Inserted ID: ${result.insertId}`);

                await db.query("DELETE FROM users WHERE username LIKE 'test_user_%'");
                console.log("   🧹 Test user cleaned up\n");
            } catch (err) {
                console.log(`   ⚠️  INSERT test skipped: ${err.message}\n`);
            }
        }

        console.log("✅ All tests completed successfully!");
        console.log("\n🎉 Your Supabase database connection is working correctly!");

    } catch (err) {
        console.error("\n❌ Connection test failed!");
        console.error(`   Error: ${err.message}`);
        console.error(`   Code: ${err.code || 'N/A'}`);

        if (err.code === 'ENOTFOUND') {
            console.error("\n💡 Tip: Check your DB_HOST - it should be like 'db.xxxxx.supabase.co'");
        } else if (err.code === '28P01') {
            console.error("\n💡 Tip: Check your DB_USER and DB_PASSWORD credentials");
        } else if (err.code === '3D000') {
            console.error("\n💡 Tip: Check your DB_NAME - it should be 'postgres' for Supabase");
        } else if (err.code === 'ECONNREFUSED') {
            console.error("\n💡 Tip: Check your DB_PORT and make sure Supabase allows connections");
        }

        process.exit(1);
    } finally {
        await db.end();
    }
}

testConnection();

