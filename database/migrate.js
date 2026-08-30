const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/udyamsetu';

async function runMigrations() {
    console.log('🔄 [PostgreSQL Migration] Connecting to PostgreSQL database...');
    console.log(`📍 Connection String: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);

    const pool = new Pool({ connectionString });

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📜 [PostgreSQL Migration] Executing schema.sql migration...');
        await pool.query(schemaSql);
        console.log('✅ [PostgreSQL Migration] All 18 PostgreSQL tables created successfully!');
    } catch (err) {
        console.error('❌ [PostgreSQL Migration Error]:', err.message);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    runMigrations();
}

module.exports = runMigrations;
