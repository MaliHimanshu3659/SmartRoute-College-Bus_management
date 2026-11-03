const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'smartroute',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    dateStrings: true
});

async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

// Test connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log(`[Database Pool] Successfully connected to MySQL database: ${process.env.MYSQL_DATABASE || 'smartroute'}`);
        connection.release();
    } catch (err) {
        console.error('[Database Pool] Connection error:', err.message);
    }
})();

module.exports = {
    pool,
    query
};
