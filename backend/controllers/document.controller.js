const path = require('path');
const fs = require('fs');
const { getDb } = require('../config/database');
const { logAuditAction } = require('../utils/logger');
const { createNotification } = require('../services/notification.service');

async function getDocuments(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { document_type, verification_status } = req.query;

        let query = `
            SELECT d.*, c.name as company_name, a.application_number, u.name as uploader_name
            FROM documents d
            JOIN companies c ON d.company_id = c.id
            LEFT JOIN applications a ON d.application_id = a.id
            LEFT JOIN users u ON d.uploaded_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (userRole === 'INDUSTRY') {
            const compRes = await db.query('SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1', [userId]);
            if (compRes.rows.length === 0) {
                return res.json({ success: true, data: [] });
            }
            params.push(compRes.rows[0].company_id);
            query += ` AND d.company_id = $${params.length}`;
        }

        if (document_type) {
            params.push(document_type);
            query += ` AND d.document_type = $${params.length}`;
        }
        if (verification_status) {
            params.push(verification_status);
            query += ` AND d.verification_status = $${params.length}`;
        }

        query += ` ORDER BY d.uploaded_at DESC`;

        const result = await db.query(query, params);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
}

async function uploadDocument(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded or file format rejected' });
        }

        const compRes = await db.query('SELECT company_id FROM user_company WHERE user_id = $1 LIMIT 1', [userId]);
        if (compRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'User is not linked to any company' });
        }

        const companyId = compRes.rows[0].company_id;
        const { name, document_type, application_id, expiry_date } = req.body;

        const docId = 'doc-' + Math.random().toString(36).substr(2, 9);
        const relativePath = '/uploads/' + req.file.filename;

        await db.query(
            `INSERT INTO documents (
                id, company_id, application_id, uploaded_by, name, original_filename,
                file_path, file_type, file_size, document_type, verification_status,
                expiry_date, uploaded_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', $11, NOW())`,
            [
                docId, companyId, application_id || null, userId,
                name || req.file.originalname, req.file.originalname,
                relativePath, req.file.mimetype, req.file.size,
                document_type || 'General', expiry_date || null
            ]
        );

        await logAuditAction(userId, 'DOCUMENT_UPLOADED', 'Document', docId, {
            filename: req.file.originalname,
            size: req.file.size
        });

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                id: docId,
                name: name || req.file.originalname,
                file_path: relativePath,
                verification_status: 'PENDING'
            }
        });
    } catch (err) {
        next(err);
    }
}

async function getDocumentById(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;

        const result = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Document record not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
}

async function verifyDocument(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const { verification_status, remarks } = req.body;
        const userId = req.user.userId;

        const docRes = await db.query(
            `SELECT d.*, uc.user_id as company_user_id FROM documents d JOIN user_company uc ON d.company_id = uc.company_id WHERE d.id = $1`,
            [id]
        );

        if (docRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const doc = docRes.rows[0];

        await db.query(
            `UPDATE documents SET
                verification_status = $1,
                remarks = $2,
                verified_at = NOW(),
                verified_by = $3
             WHERE id = $4`,
            [verification_status, remarks || '', userId, id]
        );

        await logAuditAction(userId, 'DOCUMENT_VERIFIED', 'Document', id, {
            status: verification_status,
            remarks
        });

        if (doc.company_user_id) {
            await createNotification(
                doc.company_user_id,
                'DOCUMENT_REQUEST',
                `Document ${verification_status}: ${doc.name}`,
                `Remarks from Officer: ${remarks || 'Verification status updated.'}`
            );
        }

        res.json({
            success: true,
            message: `Document status set to ${verification_status}`,
            data: { id, verification_status }
        });
    } catch (err) {
        next(err);
    }
}

async function deleteDocument(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const userId = req.user.userId;

        const docRes = await db.query('SELECT * FROM documents WHERE id = $1', [id]);
        if (docRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        const doc = docRes.rows[0];
        await db.query('DELETE FROM documents WHERE id = $1', [id]);

        await logAuditAction(userId, 'DOCUMENT_DELETED', 'Document', id, { name: doc.name });

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getDocuments,
    uploadDocument,
    getDocumentById,
    verifyDocument,
    deleteDocument
};
