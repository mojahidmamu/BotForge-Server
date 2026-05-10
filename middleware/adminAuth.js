const User = require('../models/User');

// ✅ আপনার অ্যাডমিন ইমেইল এখানে সেট করুন
const ADMIN_EMAILS = [
    'abdullahallmojahidstudent@gmail.com',
    // আরও অ্যাডমিন যোগ করতে চাইলে এখানে যোগ করুন
];

const adminAuth = async (req, res, next) => {
    try {
        const userEmail = req.headers['x-user-email'];
        
        if (!userEmail) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: No email provided'
            });
        }
        
        // ✅ প্রথমে চেক করুন ইমেইলটি অ্যাডমিন লিস্টে আছে কিনা
        const isAdminEmail = ADMIN_EMAILS.includes(userEmail.toLowerCase());
        
        if (!isAdminEmail) {
            return res.status(403).json({
                success: false,
                error: 'Access denied: Admin privileges required'
            });
        }
        
        // ডাটাবেসে ইউজার খুঁজুন (যদি থাকে)
        let user = await User.findOne({ email: userEmail.toLowerCase() });
        
        // যদি ইউজার না থাকে, তাহলে একটি তৈরি করুন
        if (!user) {
            user = await User.create({
                email: userEmail.toLowerCase(),
                name: 'Admin User',
                role: 'super_admin',
                isActive: true
            });
        } else {
            // ইউজার থাকলে রোল আপডেট করুন
            if (user.role !== 'admin' && user.role !== 'super_admin') {
                user.role = 'admin';
                await user.save();
            }
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error during authorization'
        });
    }
};

module.exports = adminAuth;