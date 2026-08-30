const { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } = require('../services/notification.service');

async function getNotifications(req, res, next) {
    try {
        const userId = req.user.userId;
        const data = await getUserNotifications(userId);
        res.json({
            success: true,
            data
        });
    } catch (err) {
        next(err);
    }
}

async function markRead(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        await markNotificationAsRead(id, userId);
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (err) {
        next(err);
    }
}

async function markAllRead(req, res, next) {
    try {
        const userId = req.user.userId;
        await markAllNotificationsAsRead(userId);
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getNotifications,
    markRead,
    markAllRead
};
