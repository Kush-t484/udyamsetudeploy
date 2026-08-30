const { getDb } = require('../config/database');

async function createNotification(userId, type, title, message) {
    try {
        const db = getDb();
        const id = 'nt-' + Math.random().toString(36).substr(2, 9);
        await db.query(
            `INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at)
             VALUES ($1, $2, $3, $4, $5, FALSE, NOW())`,
            [id, userId, type, title, message]
        );
        return true;
    } catch (err) {
        console.error('Failed to create notification:', err.message);
        return false;
    }
}

async function getUserNotifications(userId) {
    const db = getDb();
    const res = await db.query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
        [userId]
    );
    const unreadCountRes = await db.query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
        [userId]
    );
    return {
        notifications: res.rows,
        unread_count: parseInt(unreadCountRes.rows[0].count, 10)
    };
}

async function markNotificationAsRead(id, userId) {
    const db = getDb();
    await db.query(
        `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
        [id, userId]
    );
    return true;
}

async function markAllNotificationsAsRead(userId) {
    const db = getDb();
    await db.query(
        `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
        [userId]
    );
    return true;
}

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
};
