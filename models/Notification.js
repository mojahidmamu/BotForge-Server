const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['approval', 'rejection', 'login_alert', 'info'], default: 'info' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);