const Notification = require('../models/Notification');
const { sendApprovalEmail, sendRejectionEmail,sendAdminLoginCode, sendNewAdminNotification  } = require('../config/email');
const User = require('../models/User');
const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
// const Contact = require('../models/Contact');
const Admin = require('../models/Admin');
const AdminOTP = require('../models/AdminOTP'); 

// ✅ Admin emails from config
let ADMIN_EMAILS = [];
try {
    const adminEmailsConfig = require('../config/adminEmails');
    ADMIN_EMAILS = adminEmailsConfig.ADMIN_EMAILS || [];
} catch (err) {
    ADMIN_EMAILS = ['abdullahallmojahidstudent@gmail.com'];
}

// ✅ Check Admin
exports.checkAdmin = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.json({ isAdmin: false, role: 'user' });
        }
        const normalizedEmail = email.toLowerCase();
        const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            user = await User.create({
                email: normalizedEmail,
                role: isAdmin ? 'admin' : 'user',
                name: email.split('@')[0],
                isActive: true
            });
        } else {
            if (isAdmin && user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
            }
        }
        res.json({ isAdmin, role: user.role || (isAdmin ? 'admin' : 'user') });
    } catch (error) {
        console.error('Check admin error:', error);
        res.status(500).json({ isAdmin: false, role: 'user', error: error.message });
    }
};

// ✅ ড্যাশবোর্ড পরিসংখ্যান
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMembers = await Student.countDocuments({ status: 'approved' });
        const totalPending = await Student.countDocuments({ status: 'pending' });
        const recentActivities = await Student.find().sort({ appliedAt: -1 }).limit(5);
        res.json({
            success: true,
            data: {
                totalUsers,
                totalMembers,
                totalPending,
                totalDonations: 0,
                recentActivities
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ ইউজার ম্যানেজমেন্ট (আপডেটেড - পেজিনেশন সহ)
exports.getAllUsers = async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 10 } = req.query;
        
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role && role !== 'all') query.role = role;
        if (status === 'active') query.isActive = true;
        else if (status === 'suspended') query.isActive = false;
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        const total = await User.countDocuments(query);
        
        res.json({
            success: true,
            data: users,      // ← ইউজার ডাটা
            total: total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// ✅ ইউজার ডিলিট
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        // আপনার ট্রানজেকশন মডেল থেকে ডাটা আনুন
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ ইউজার রোল পরিবর্তন
exports.changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        
        const validRoles = ['user', 'admin', 'super_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }
        
        const user = await User.findByIdAndUpdate(
            id,
            { role, updatedAt: Date.now() },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Change user role error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// ✅ ইউজার সাসপেন্ড
exports.suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false, suspendedAt: Date.now(), updatedAt: Date.now() },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, message: 'User suspended successfully', data: user });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ ইউজার এক্টিভেট
exports.activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdAndUpdate(
            id,
            { isActive: true, activatedAt: Date.now(), updatedAt: Date.now() },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, message: 'User activated successfully', data: user });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ মেম্বার ম্যানেজমেন্ট
exports.getAllMembers = async (req, res) => {
    try {
        const members = await Student.find().sort({ appliedAt: -1 });
        res.json({ success: true, data: members });
    } catch (error) {
        console.error('Get all members error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        await Student.findByIdAndDelete(id);
        res.json({ success: true, message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const member = await Student.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true }
        );
        res.json({ success: true, data: member });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ কন্টাক্ট ফর্ম ডাটা
exports.getContactMessages = async (req, res) => {
    try {
        // const messages = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, data: [] });
    } catch (error) {
        console.error('Get contact messages error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteContactMessage = async (req, res) => {
    try {
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete contact message error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ পেন্ডিং রিকোয়েস্ট
exports.getPendingRequests = async (req, res) => {
    try {
        const pending = await Student.find({ status: 'pending' }).sort({ appliedAt: 1 });
        res.json({ success: true, count: pending.length, data: pending });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ সব স্টুডেন্ট
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ appliedAt: -1 });
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ অ্যানালিটিক্স
exports.getAnalytics = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const pendingCount = await Student.countDocuments({ status: 'pending' });
        const approvedCount = await Student.countDocuments({ status: 'approved' });
        const rejectedCount = await Student.countDocuments({ status: 'rejected' });
        
        const departmentCount = await Student.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const count = await Student.countDocuments({
                appliedAt: { $gte: monthStart, $lte: monthEnd }
            });
            last6Months.push({ month: months[date.getMonth()], count });
        }
        
        res.json({
            success: true,
            data: {
                totalStudents,
                pendingCount,
                approvedCount,
                rejectedCount,
                departmentCount,
                monthlyRegistrations: last6Months
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Approve student + send email
exports.approveStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ success: false });
        }

        student.status = 'approved';
        student.approvedAt = new Date();
        await student.save();

        // ✅ Send email
        await sendApprovalEmail(student.email, student.name);

        res.json({
            success: true,
            message: 'Approved + Email Sent'
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// ✅ Reject student + send email
exports.rejectStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const student = await Student.findById(id);

        student.status = 'rejected';
        student.rejectionReason = reason;
        await student.save();

        // ✅ Send email
        await sendRejectionEmail(student.email, student.name, reason);

        res.json({
            success: true,
            message: 'Rejected + Email Sent'
        });

    } catch (error) {
        res.status(500).json({ success: false });
    }
};

// ✅ স্টুডেন্ট অ্যাকশন
exports.handleStudentAction = async (req, res) => {
    try {
        const { id, action, rejectionReason } = req.body;
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        
        if (action === 'approve') {
            student.status = 'approved';
            student.approvedAt = new Date();
            await student.save();
            res.json({ success: true, message: 'Student approved successfully', emailSent: false });
        } else if (action === 'reject') {
            student.status = 'rejected';
            student.rejectedAt = new Date();
            student.rejectionReason = rejectionReason;
            await student.save();
            res.json({ success: true, message: 'Student rejected', emailSent: false });
        } else {
            res.status(400).json({ success: false, error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Handle student action error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// ✅ সব ট্রানজেকশন পাওয়ার জন্য
exports.getTransactions = async (req, res) => {
    try {
        const { search, type, status, page = 1, limit = 10 } = req.query;
        
        let query = {};
        if (type && type !== 'all') query.type = type;
        if (status && status !== 'all') query.status = status;
        
        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        const total = await Transaction.countDocuments(query);
        
        res.json({
            success: true,
            data: transactions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ নতুন ট্রানজেকশন তৈরি করার জন্য
exports.createTransaction = async (req, res) => {
    try {
        const { type, category, amount, user, paymentMethod, description } = req.body;
        
        // ভ্যালিডেশন
        if (!type || !category || !amount || !user?.name || !user?.email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: type, category, amount, user name, user email'
            });
        }
        
        const transaction = new Transaction({
            type,
            category,
            amount,
            user: {
                name: user.name,
                email: user.email,
                roll: user.roll || ''
            },
            paymentMethod: paymentMethod || 'cash',
            description: description || '',
            status: 'completed',
            createdBy: req.user?._id
        });
        
        await transaction.save();
        
        res.json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ ট্রানজেকশন আপডেট করার জন্য
exports.updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        updateData.updatedAt = Date.now();
        
        const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!transaction) {
            return res.status(404).json({ success: false, error: 'Transaction not found' });
        }
        
        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: transaction
        });
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ ট্রানজেকশন ডিলিট করার জন্য
exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        await Transaction.findByIdAndDelete(id);
        res.json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
///////
// ✅ সব অ্যাডমিন লিস্ট পাওয়ার জন্য
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().sort({ createdAt: -1 });
        res.json({ success: true, data: admins });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ নতুন অ্যাডমিন যোগ করার জন্য (শুধু সুপার অ্যাডমিন)
exports.addNewAdmin = async (req, res) => {
    try {
        const { email, name, role } = req.body;
        
        // চেক করা ইমেইলটি ইতিমধ্যে অ্যাডমিন কিনা
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false, 
                error: 'This email is already an admin!' 
            });
        }
        
        // নতুন অ্যাডমিন তৈরি
        const newAdmin = await Admin.create({
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            role: role || 'admin',
            addedBy: req.user?.email || 'System'
        });
        
        // নতুন অ্যাডমিনকে নোটিফিকেশন ইমেইল পাঠান
        await sendNewAdminNotification(email, name);
        
        res.json({ 
            success: true, 
            message: 'New admin added successfully! They will receive an email.',
            data: newAdmin 
        });
        
    } catch (error) {
        console.error('Add admin error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ অ্যাডমিন রিমুভ করার জন্য
exports.removeAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findById(id);
        
        if (!admin) {
            return res.status(404).json({ success: false, error: 'Admin not found' });
        }
        
        // সুপার অ্যাডমিন রিমুভ করা যাবে না
        if (admin.role === 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                error: 'Cannot remove super admin!' 
            });
        }
        
        await Admin.findByIdAndDelete(id);
        res.json({ success: true, message: 'Admin removed successfully' });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ অ্যাডমিন লগইনের জন্য কোড পাঠানো
exports.sendAdminLoginCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }
        
        // চেক করা এই ইমেইলটি অ্যাডমিন কিনা
        const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
        
        if (!admin) {
            return res.status(403).json({ 
                success: false, 
                error: 'You are not authorized as admin!' 
            });
        }
        
        // 6-ডিজিট কোড জেনারেট
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // পুরাতন কোড ডিলিট
        await AdminOTP.deleteMany({ email: email.toLowerCase() });
        
        // নতুন কোড সেভ
        await AdminOTP.create({
            email: email.toLowerCase(),
            code: code
        });
        
        // ইমেইল পাঠান
        await sendAdminLoginCode(email, code, admin.name);
        
        res.json({ 
            success: true, 
            message: 'Security code sent to your email',
            role: admin.role 
        });
        
    } catch (error) {
        console.error('Send code error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ কোড ভেরিফাই করার জন্য
exports.verifyAdminCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const otp = await AdminOTP.findOne({ email: email.toLowerCase(), code: code });
        
        if (!otp) {
            return res.status(401).json({ success: false, error: 'Invalid or expired code' });
        }
        
        // লাস্ট লগিন আপডেট
        await Admin.findOneAndUpdate(
            { email: email.toLowerCase() },
            { lastLogin: new Date() }
        );
        
        // কোড ডিলিট
        await AdminOTP.deleteOne({ _id: otp._id });
        
        res.json({ success: true, message: 'Code verified successfully' });
        
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ✅ চেক করা ইউজার অ্যাডমিন কিনা
exports.checkAdmin = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.json({ isAdmin: false, role: null });
        }
        
        const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
        
        if (admin) {
            return res.json({ isAdmin: true, role: admin.role });
        }
        
        res.json({ isAdmin: false, role: null });
        
    } catch (error) {
        res.json({ isAdmin: false, role: null });
    }
};