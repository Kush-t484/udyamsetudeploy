const { getDb } = require('../config/database');

async function globalSearch(req, res, next) {
    try {
        const db = getDb();
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ success: true, data: { approvals: [], applications: [], schemes: [], compliance: [], documents: [] } });
        }

        const searchTerm = `%${q.trim()}%`;

        // Search Approvals
        const approvalsRes = await db.query(
            `SELECT id, name, category, description FROM approvals WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5`,
            [searchTerm]
        );

        // Search Applications
        const appsRes = await db.query(
            `SELECT a.id, a.application_number, a.status, ap.name as approval_name
             FROM applications a JOIN approvals ap ON a.approval_id = ap.id
             WHERE a.application_number ILIKE $1 OR ap.name ILIKE $1 LIMIT 5`,
            [searchTerm]
        );

        // Search Schemes
        const schemesRes = await db.query(
            `SELECT id, name, department, description, benefits FROM schemes WHERE name ILIKE $1 OR description ILIKE $1 OR benefits ILIKE $1 LIMIT 5`,
            [searchTerm]
        );

        // Search Compliance
        const complianceRes = await db.query(
            `SELECT id, name, category, description, frequency FROM compliance_requirements WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 5`,
            [searchTerm]
        );

        // Search Documents
        const docsRes = await db.query(
            `SELECT id, name, document_type, verification_status FROM documents WHERE name ILIKE $1 OR original_filename ILIKE $1 LIMIT 5`,
            [searchTerm]
        );

        res.json({
            success: true,
            data: {
                approvals: approvalsRes.rows,
                applications: appsRes.rows,
                schemes: schemesRes.rows,
                compliance: complianceRes.rows,
                documents: docsRes.rows
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    globalSearch
};
