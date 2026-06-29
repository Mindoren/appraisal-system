const { Pool } = require('pg');
require('dotenv').config();

// Setup connection configurations
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
}); 

// Test the connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ PostgreSQL Connection Failed:', err.stack);
    } else {
        console.log('🚀 PostgreSQL Connected Successfully at:', res.rows[0].now);
    }
});

module.exports = pool;