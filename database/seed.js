const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/udyamsetu';

async function runSeed() {
    console.log('🌱 [PostgreSQL Seed] Connecting to PostgreSQL database...');
    const pool = new Pool({ connectionString });

    try {
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');

        console.log('📜 [PostgreSQL Seed] Executing seed.sql data script...');
        await pool.query(seedSql);
        console.log('✅ [PostgreSQL Seed] Demo data populated successfully!');
    } catch (err) {
        console.error('❌ [PostgreSQL Seed Error]:', err.message);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    runSeed();
}

module.exports = runSeed;
