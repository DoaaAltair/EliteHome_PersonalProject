// Shared database connection for serverless functions
require("dotenv").config();
const { Pool } = require("pg");

let pool = null;
let poolConfig = null;

// Lazy initialization - don't crash on module load
function getPoolConfig() {
    if (poolConfig) {
        return poolConfig;
    }

    if (process.env.DATABASE_URL) {
        poolConfig = {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 20000, // Increased for serverless
            idleTimeoutMillis: 30000,
            max: 1, // Serverless: use 1 connection per function instance
            allowExitOnIdle: true // Allow pool to close when idle (important for serverless)
        };
    } else {
        const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('❌ Missing required environment variables:', missingVars.join(', '));
            // Don't throw - return null and let the execute function handle it
            return null;
        }

        poolConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 5432,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 20000,
            idleTimeoutMillis: 30000,
            max: 1, // Serverless: use 1 connection per function instance
            allowExitOnIdle: true
        };
    }

    return poolConfig;
}

function getPool() {
    if (pool) {
        return pool;
    }

    const config = getPoolConfig();
    if (!config) {
        return null;
    }

    try {
        pool = new Pool(config);

        // Handle pool errors gracefully
        pool.on('error', (err) => {
            console.error('❌ Unexpected database pool error:', err);
        });

        // Test connection on initialization (non-blocking)
        pool.query('SELECT 1')
            .then(() => {
                console.log('✅ Database pool initialized successfully');
            })
            .catch((err) => {
                console.error('❌ Database pool initialization failed:', err.message);
                console.error('   DATABASE_URL exists:', !!process.env.DATABASE_URL);
            });

        return pool;
    } catch (error) {
        console.error('❌ Failed to create database pool:', error.message);
        return null;
    }
}

// MySQL-compatible execute method
async function execute(query, params = []) {
    const poolInstance = getPool();

    if (!poolInstance) {
        const config = getPoolConfig();
        if (!config) {
            throw new Error('Database configuration is missing. Please set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, DB_NAME environment variables.');
        }
        throw new Error('Database pool failed to initialize. Check your database connection settings.');
    }

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
        const result = await poolInstance.query(pgQuery, params);

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
        console.error('❌ Database query error:', error.message);
        console.error('   Query:', query.substring(0, 100));
        if (error.code === '42703') {
            error.code = 'ER_BAD_FIELD_ERROR';
        }
        throw error;
    }
}

// Export an object with execute method for compatibility
const db = {
    execute,
    query: async (query, params) => {
        const poolInstance = getPool();
        if (!poolInstance) {
            throw new Error('Database pool not initialized');
        }
        return poolInstance.query(query, params);
    }
};

module.exports = db;
