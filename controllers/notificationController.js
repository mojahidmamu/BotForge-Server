const Notification = require('../models/Notification');

// ইউজারের নোটিফিকেশন দেখা
const getMyNotifications = async (req, res) => {
    try {
        const { userId } = req.query;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });
        
        res.json({ success: true, unreadCount, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// নোটিফিকেশন রিড করা
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// সব নোটিফিকেশন রিড করা
const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };