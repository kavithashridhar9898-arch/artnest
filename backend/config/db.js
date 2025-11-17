/**
 * Database Configuration
 * PostgreSQL connection pool setup for ArtNest platform
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool for better performance
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
        if (err.code === 'ETIMEDOUT') {
            console.error('Database connection timed out.');
        }
    } else {
        console.log('✅ Database connected successfully');
        release();
    }
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
    if (err.code === 'ECONNRESET') {
        console.error('Database connection lost. Reconnecting...');
    }
});

// Wrapper to match MySQL2 promise API
const promisePool = {
    query: async (text, params) => {
        const result = await pool.query(text, params);
        return [result.rows, result.fields];
    },
    execute: async (text, params) => {
        const result = await pool.query(text, params);
        return [result.rows, result.fields];
    }
};

module.exports = promisePool;
