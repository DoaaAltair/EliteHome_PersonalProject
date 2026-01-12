// Shared database connection for serverless functions
require("dotenv").config();
const { Pool } = require("pg");

let poolConfig;

if (process.env.DATABASE_URL) {
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
        idleTimeoutMillis: 30000,
        max: 20
    };
} else {
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        throw new Error(`Missing database config: ${missingVars.join(', ')}`);
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

// MySQL-compatible execute method
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

