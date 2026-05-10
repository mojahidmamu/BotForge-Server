const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 
const { sendAdminLoginCode } = require('../config/email');
const AdminOTP = require('../models/AdminOTP');


// অ্যাডমিন ম্যানেজমেন্ট রাউট
router.get('/admins', adminController.getAllAdmins);
router.post('/admins', adminController.addNewAdmin);
router.delete('/admins/:id', adminController.removeAdmin);

// অ্যাডমিন লগইন রাউট
router.post('/send-login-code', adminController.sendAdminLoginCode);
router.post('/verify-code', adminController.verifyAdminCode);
router.get('/check-admin', adminController.checkAdmin); 

// ✅ ড্যাশবোর্ড
router.get('/dashboard-stats', adminController.getDashboardStats);

// ✅ পেন্ডিং রিকোয়েস্ট
router.get('/pending', adminController.getPendingRequests);

// ✅ অ্যানালিটিক্স
router.get('/analytics', adminController.getAnalytics);

// ✅ ইউজার ম্যানেজমেন্ট
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.changeUserRole);
router.put('/users/:id/suspend', adminController.suspendUser);
router.put('/users/:id/activate', adminController.activateUser);
router.delete('/users/:id', adminController.deleteUser);

// ✅ মেম্বার ম্যানেজমেন্ট
router.get('/members', adminController.getAllMembers);
router.delete('/members/:id', adminController.deleteMember);
router.put('/members/:id', adminController.updateMember);

// ✅ কন্টাক্ট মেসেজ
router.get('/contact-messages', adminController.getContactMessages);
router.delete('/contact-messages/:id', adminController.deleteContactMessage);

// ✅ স্টুডেন্ট অ্যাকশন
router.put('/student-action', adminController.handleStudentAction);


// ট্রানজেকশন রাউট
router.get('/transactions', adminController.getTransactions);
router.post('/transactions', adminController.createTransaction);
router.put('/transactions/:id', adminController.updateTransaction);
router.delete('/transactions/:id', adminController.deleteTransaction);



// ✅ সেন্ড ক্যাপচা কোড টু অ্যাডমিন ইমেইল
router.post('/send-login-code', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        
        // চেক করা ইমেইলটি অ্যাডমিন কিনা
        const ADMIN_EMAILS = ['abdullahallmojahidstudent@gmail.com'];
        if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
            return res.status(403).json({ success: false, error: 'You are not authorized as admin' });
        }
        
        // 6-ডিজিট র‍্যান্ডম কোড জেনারেট করুন
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // পুরাতন কোড ডিলিট করুন
        await AdminOTP.deleteMany({ email: email.toLowerCase() });
        
        // নতুন কোড সেভ করুন
        await AdminOTP.create({
            email: email.toLowerCase(),
            code: code
        });
        
        // ইমেইল পাঠান
        await sendAdminLoginCode(email, code);
        
        res.json({ success: true, message: 'Security code sent to your email' });
        
    } catch (error) {
        console.error('Send code error:', error);
        res.status(500).json({ success: false, error: 'Failed to send code' });
    }
});

// ✅ ভেরিফাই ক্যাপচা কোড
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({ success: false, error: 'Email and code are required' });
        }
        
        const otp = await AdminOTP.findOne({ email: email.toLowerCase(), code: code });
        
        if (!otp) {
            return res.status(401).json({ success: false, error: 'Invalid or expired code' });
        }
        
        // কোড ব্যবহার হয়ে গেছে, ডিলিট করুন
        await AdminOTP.deleteOne({ _id: otp._id });
        
        res.json({ success: true, message: 'Code verified successfully' });
        
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify code' });
    }
});

module.exports = router;