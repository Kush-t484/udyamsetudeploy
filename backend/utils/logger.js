const { getDb } = require('../config/database');

const logger = {
    info: (msg, data = '') => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, data ? JSON.stringify(data) : ''),
    warn: (msg, data = '') => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, data ? JSON.stringify(data) : ''),
    error: (msg, err = '') => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err),
    
    logAuditAction: async (userId, action, entityType, entityId, metadata = {}, ipAddress = '127.0.0.1') => {
        try {
            const db = getDb();
            const id = 'aud-' + Math.random().toString(36).substr(2, 9);
            const metadataStr = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
            
            await db.query(
                `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, ip_address, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
                [id, userId, action, entityType, entityId, metadataStr, ipAddress]
            );
        } catch (error) {
            console.error('Audit Log Error:', error.message);
        }
    }
};

module.exports = logger;
