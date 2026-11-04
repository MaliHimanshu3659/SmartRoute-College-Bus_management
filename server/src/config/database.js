const mysql = require('mysql2/promise');
require('dotenv').config();

function getPoolConfig() {
    const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

    if (dbUrl) {
        return {
            uri: dbUrl,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            dateStrings: true,
            ssl: process.env.MYSQL_SSL === 'true' || dbUrl.includes('ssl')
                ? { rejectUnauthorized: false }
                : undefined
        };
    }

    return {
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
        dateStrings: true,
        ssl: process.env.MYSQL_SSL === 'true'
            ? { rejectUnauthorized: false }
            : undefined
    };
}

const pool = mysql.createPool(getPoolConfig());

async function query(sql, params = []) {
    const [results] = await pool.execute(sql, params);
    return results;
}

// Test connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        const dbName = process.env.MYSQL_DATABASE || (process.env.DATABASE_URL ? 'Cloud MySQL' : 'smartroute');
        console.log(`[Database Pool] Successfully connected to MySQL database: ${dbName}`);
        connection.release();
    } catch (err) {
        console.error('[Database Pool] Connection error:', err.message);
    }
})();

module.exports = {
    pool,
    query
};
