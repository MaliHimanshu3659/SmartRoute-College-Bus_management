const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
    console.log('[Database] Starting database initialization...');

    const config = {
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        multipleStatements: true
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log(`[Database] Connected to MySQL at ${config.host}:${config.port}`);

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        console.log('[Database] Executing schema.sql...');
        await connection.query(schemaSql);
        console.log('[Database] Schema created successfully.');

        const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
        console.log('[Database] Executing seed.sql...');
        await connection.query(seedSql);
        console.log('[Database] Seed data inserted successfully.');

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

