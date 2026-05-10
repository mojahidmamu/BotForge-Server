// backend/models/AuditLog.js
const auditLogSchema = new mongoose.Schema({
    action: String,
    adminEmail: String,
    adminName: String,
    targetType: String,
    targetId: String,
    targetName: String,
    details: Object,
    status: String,
    timestamp: { type: Date, default: Date.now }
});

// backend/routes/adminRoutes.js
router.get('/audit-logs', adminController.getAuditLogs);

// backend/controllers/adminController.js
exports.getAuditLogs = async (req, res) => {
    const { search, action, page = 1, limit = 20 } = req.query;
    // আপনার ইমপ্লিমেন্টেশন
};