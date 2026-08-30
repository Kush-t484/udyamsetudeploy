const { getDb } = require('../config/database');
const { processAIChat } = require('../services/ai.service');

async function chat(req, res, next) {
    try {
        const userId = req.user.userId;
        const { question, conversation_id } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ success: false, message: 'Question parameter is required' });
        }

        const response = await processAIChat(userId, question.trim(), conversation_id);

        res.json({
            success: true,
            data: response
        });
    } catch (err) {
        next(err);
    }
}

async function getConversations(req, res, next) {
    try {
        const db = getDb();
        const userId = req.user.userId;

        const result = await db.query(
            `SELECT * FROM ai_conversations WHERE user_id = $1 ORDER BY updated_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
}

async function getConversationById(req, res, next) {
    try {
        const db = getDb();
        const { id } = req.params;
        const userId = req.user.userId;

        const convRes = await db.query('SELECT * FROM ai_conversations WHERE id = $1 AND user_id = $2', [id, userId]);
        if (convRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Conversation not found' });
        }

        const msgsRes = await db.query('SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC', [id]);

        res.json({
            success: true,
            data: {
                conversation: convRes.rows[0],
                messages: msgsRes.rows
            }
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    chat,
    getConversations,
    getConversationById
};
