const mysql = require('mysql2/promise');
require('dotenv').config();

const TIDB_CLOUD_URL = 'mysql://2HDJ6LitKyD9sar.root:YewDGQgJk66jEgUn@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/smartroute';

function getPoolConfig() {
    let dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

    // In serverless / Vercel cloud runtime, use the TiDB Cloud MySQL database
    if (process.env.VERCEL) {
        if (!dbUrl || dbUrl.includes('sslmode') || !dbUrl.includes('tidbcloud')) {
            dbUrl = TIDB_CLOUD_URL;
        }
    }

    if (dbUrl) {
        const needsSsl = process.env.MYSQL_SSL === 'true' || 
                         dbUrl.includes('ssl') || 
                         dbUrl.includes('tidbcloud.com') || 
                         dbUrl.includes('aivencloud.com');
        return {
            uri: dbUrl,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            dateStrings: true,
            ssl: needsSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined
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
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
            console.error('[Database Connection Error]', err.message);
            throw new Error('Database connection failed. Please ensure a valid cloud MySQL DATABASE_URL is configured in your environment variables.');
        }
        throw err;
    }
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
