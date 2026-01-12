require("dotenv").config();
const { Pool } = require("pg");

// Support both connection string and individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
    // Use connection string if provided (recommended for Supabase)
    // Supabase requires SSL, so always enable it
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Supabase requires SSL
        connectionTimeoutMillis: 15000, // Increased timeout for Vercel
        idleTimeoutMillis: 30000,
        max: 20
    };
} else {
    // Use individual parameters (fallback)
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        console.error('💡 Please check your .env file in the backend directory');
        console.error('💡 Or use DATABASE_URL connection string instead');
        process.exit(1);
    }

    poolConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 20
    };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err.message);
    if (err.code === 'ENOTFOUND') {
        console.error('💡 Database hostname not found. Please check:');
        console.error('   - Is your Supabase project still active?');
        console.error('   - Is the DB_HOST correct in your .env file?');
        console.error('   - Do you have internet connection?');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('💡 Connection refused. Please check:');
        console.error('   - Is the database server running?');
        console.error('   - Is the DB_PORT correct?');
    } else if (err.code === '28P01') {
        console.error('💡 Authentication failed. Please check:');
        console.error('   - Is DB_USER correct?');
        console.error('   - Is DB_PASSWORD correct?');
    }
});

pool.execute = async function (query, params = []) {
    let paramIndex = 1;
    let pgQuery = query.replace(/\?/g, () => `$${paramIndex++}`);

    const queryType = query.trim().toUpperCase().split(/\s+/)[0];
    const isSelect = queryType === 'SELECT';
    const isInsert = queryType === 'INSERT';
    const isUpdate = queryType === 'UPDATE';
    const isDelete = queryType === 'DELETE';

    if (isInsert && !/RETURNING/i.test(pgQuery)) {
        pgQuery = pgQuery.replace(/;?\s*$/, ' RETURNING id');
    }

    try {
        const result = await pool.query(pgQuery, params);

        if (isSelect) {
            return [result.rows, []];
        } else {
            const mysqlResult = {
                insertId: result.rows[0]?.id || null,
                affectedRows: result.rowCount || 0,
                rowCount: result.rowCount || 0
            };
            return [mysqlResult, []];
        }
    } catch (error) {
        if (error.code === '42703') {
            error.code = 'ER_BAD_FIELD_ERROR';
        }
        throw error;
    }
};

module.exports = pool;