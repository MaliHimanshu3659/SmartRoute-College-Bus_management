const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    console.log('[Database] Starting database initialization...');

    const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
    let connection;

    try {
        if (dbUrl) {
            connection = await mysql.createConnection({
                uri: dbUrl,
                multipleStatements: true,
                ssl: process.env.MYSQL_SSL === 'true' || dbUrl.includes('ssl')
                    ? { rejectUnauthorized: false }
                    : undefined
            });
            console.log('[Database] Connected to Cloud MySQL via connection URI');
        } else {
            const host = process.env.MYSQL_HOST || 'localhost';
            const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
            const user = process.env.MYSQL_USER || 'root';
            const password = process.env.MYSQL_PASSWORD || '';
            const database = process.env.MYSQL_DATABASE || 'smartroute';

            // 1. Connect without database to ensure database exists
            const rootConn = await mysql.createConnection({
                host,
                port,
                user,
                password,
                multipleStatements: true
            });
            await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await rootConn.end();

            // 2. Connect to the target database
            connection = await mysql.createConnection({
                host,
                port,
                user,
                password,
                database,
                multipleStatements: true
            });
            console.log(`[Database] Connected to MySQL at ${host}:${port}/${database}`);
        }

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        console.log('[Database] Executing schema.sql...');
        await connection.query(schemaSql);
        console.log('[Database] Schema created successfully.');

        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
        console.log('[Database] Executing seed.sql...');
        await connection.query(seedSql);
        console.log('[Database] Seed data verified/inserted successfully.');

        console.log('[Database] Database setup completed successfully!');
    } catch (err) {
        console.error('[Database] Error initializing database:', err);
        process.exitCode = 1;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };
