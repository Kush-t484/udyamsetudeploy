const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('./env');

let db = null;
let isInMemory = false;

async function initDatabase() {
    const schemaSqlPath = path.join(__dirname, '../../database/schema.sql');
    const seedSqlPath = path.join(__dirname, '../../database/seed.sql');

    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

    // Strategy 1: Real PostgreSQL Connection
    try {
        const pool = new Pool({
            connectionString: env.DATABASE_URL,
            connectionTimeoutMillis: 2000
        });

        // Test connection
        const client = await pool.connect();
        client.release();

        console.log('✅ [Database] Connected to PostgreSQL instance.');

        // Apply schema and seed
        await pool.query(schemaSql);
        console.log('✅ [Database] Schema executed successfully.');

        const userCheck = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCheck.rows[0].count, 10) === 0) {
            await pool.query(seedSql);
            console.log('🌱 [Database] Seed data populated successfully.');
        }

        db = {
            query: (text, params) => pool.query(text, params),
            getClient: () => pool.connect(),
            withTransaction: async (callback) => {
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    const result = await callback(client);
                    await client.query('COMMIT');
                    return result;
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                } finally {
                    client.release();
                }
            },
            pool
        };
        return db;
    } catch (pgError) {
        console.log('⚠️ [Database] Real PostgreSQL server not reachable on localhost:5432 or DATABASE_URL.');
        console.log('🔄 [Database] Initializing high-performance PostgreSQL In-Memory Engine (pg-mem)...');
    }

    // Strategy 2: In-Memory PostgreSQL Engine Fallback (pg-mem adapter)
    try {
        const { newDb } = require('pg-mem');
        const memoryDb = newDb();

        memoryDb.public.registerFunction({
            name: 'uuid_generate_v4',
            returns: memoryDb.public.getType('text'),
            implementation: () => 'uuid-' + Math.random().toString(36).substring(2, 11)
        });

        const cleanSchema = schemaSql
            .replace(/WITH TIME ZONE/gi, '')
            .replace(/NUMERIC\(\d+,\s*\d+\)/gi, 'NUMERIC')
            .replace(/CREATE INDEX IF NOT EXISTS.*?;/g, '');

        memoryDb.public.none(cleanSchema);

        const cleanSeed = seedSql
            .replace(/WITH TIME ZONE/gi, '')
            .replace(/NOW\(\) - INTERVAL '[^']+'/gi, "'2026-08-20 10:00:00'")
            .replace(/NOW\(\) \+ INTERVAL '[^']+'/gi, "'2026-09-20 10:00:00'")
            .replace(/NOW\(\)/gi, "'2026-08-27 12:00:00'");

        memoryDb.public.none(cleanSeed);

        const { Pool: MemPool } = memoryDb.adapters.createPg();
        const memPool = new MemPool();

        console.log('✅ [Database] In-Memory PostgreSQL Engine & Seed populated.');

        isInMemory = true;
        db = {
            query: (text, params) => memPool.query(text, params),
            getClient: () => memPool.connect(),
            withTransaction: async (callback) => {
                const client = await memPool.connect();
                try {
                    await client.query('BEGIN');
                    const result = await callback(client);
                    await client.query('COMMIT');
                    return result;
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                } finally {
                    client.release();
                }
            },
            pool: memPool
        };
        return db;
    } catch (fallbackError) {
        console.error('❌ [Database] Failed to initialize DB:', fallbackError.message);
        throw fallbackError;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

module.exports = {
    initDatabase,
    getDb,
    isInMemory: () => isInMemory
};
