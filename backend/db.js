require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
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