const Student = require('../models/Student');
const Notification = require('../models/Notification');
const { sendAdminNotificationEmail, sendApprovalEmail, sendRejectionEmail } = require('../config/email');

// ✅ Apply for membership + send email to admin
const applyForMembership = async (req, res) => {
    try {
        const { 
            name, email, phone, roll, registration,
            department, session, cgpa, district, currentJob,
            skills, socialLink, bloodGroup, role
        } = req.body;

        // Roll validation - 6 digits
        if (roll && roll.length !== 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Roll number must be exactly 6 digits' 
            });
        }
        
        // Registration validation - 10 digits
        if (registration && registration.length !== 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'Registration number must be exactly 10 digits' 
            });
        }
        
        // Check if student already exists
        const existingStudent = await Student.findOne({ 
            $or: [{ email }, { roll }, { registration }] 
        });
        
        if (existingStudent) {
            let errorMessage = '';
            if (existingStudent.email === email) errorMessage = 'This email is already registered!';
            else if (existingStudent.roll === roll) errorMessage = 'This roll number is already registered!';
            else if (existingStudent.registration === registration) errorMessage = 'This registration number is already registered!';
            
            return res.status(409).json({ 
                success: false, 
                message: errorMessage || 'Student already exists!'
            });
        }
        
        // Handle photo
        let photoUrl = '';
        if (req.file) {
            photoUrl = req.file.path;
        } else if (req.body.photo) {
            photoUrl = req.body.photo;
        }
        
        // Create student
        const student = await Student.create({
            name,
            email,
            phone,
            roll,
            registration,
            department,
            session,
            cgpa: parseFloat(cgpa),
            district: district || '',
            currentJob: currentJob || '',
            skills: skills || '',
            socialLink: socialLink || '',
            bloodGroup: bloodGroup || '',
            role: role || 'student',
            photo: photoUrl,
            status: 'pending'
        });
        
        // ✅ Send email to admin about new application
        await sendAdminNotificationEmail({
            name,
            email,
            phone,
            roll,
            registration,
            department,
            session,
            cgpa,
            skills
        });
        
        res.status(201).json({ 
            success: true, 
            message: 'Application submitted successfully! Admin will review your application.',
            data: student
        });
        
    } catch (error) {
        console.error('Apply Error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ 
                success: false, 
                message: `${field} already exists! Please use a different ${field}.`
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// স্টুডেন্টের স্ট্যাটাস দেখা
const getMyStatus = async (req, res) => {
    try {
        const { email, roll } = req.query;
        const student = await Student.findOne({ $or: [{ email }, { roll }] });
        
        if (!student) {
            return res.status(404).json({ success: false, message: 'No application found' });
        }
        
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
 
// অ্যাপ্রুভড স্টুডেন্ট লিস্ট (পাবলিক)
const getApprovedStudents = async (req, res) => {
    try {
        const { search, department, bloodGroup, sortBy, order } = req.query;
        let query = { status: 'approved' };
        
        // সার্চ ফিল্টার
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }
        
        // ডিপার্টমেন্ট ফিল্টার
        if (department && department !== 'all') {
            query.department = department;
        }
        
        // ✅ ব্লাড গ্রুপ ফিল্টার (নতুন যোগ)
        if (bloodGroup && bloodGroup !== 'all') {
            query.bloodGroup = bloodGroup;
        }
        
        // সর্টিং
        let sortOptions = {};
        if (sortBy === 'cgpa') {
            sortOptions.cgpa = order === 'asc' ? 1 : -1;
        } else if (sortBy === 'session') {
            sortOptions.session = order === 'asc' ? 1 : -1;
        } else {
            sortOptions.appliedAt = -1;
        }
        
        const students = await Student.find(query).sort(sortOptions);
        
        res.json({ 
            success: true, 
            count: students.length,
            data: students 
        });
    } catch (error) {
        console.error('Get approved students error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Handle approve/reject with email
const handleStudentAction = async (req, res) => {
    try {
        const { id, action, rejectionReason } = req.body;
        
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                error: 'Student not found' 
            });
        }
        
        if (action === 'approve') {
            student.status = 'approved';
            student.approvedAt = new Date();
            await student.save();
            
            // ✅ Send approval email to user
            await sendApprovalEmail(student.email, student.name);
            
            // Create notification
            await Notification.create({
                studentId: student._id,
                title: 'Membership Approved',
                message: `Dear ${student.name}, your membership has been approved. Welcome to BSPI Robotics Club!`,
                type: 'approval'
            });
            
            res.json({ 
                success: true, 
                message: 'Student approved successfully! Email sent to user.',
                emailSent: true 
            });
            
        } else if (action === 'reject') {
            student.status = 'rejected';
            student.rejectedAt = new Date();
            student.rejectionReason = rejectionReason || 'No specific reason provided';
            await student.save();
            
            // ✅ Send rejection email to user
            await sendRejectionEmail(student.email, student.name, rejectionReason);
            
            await Notification.create({
                studentId: student._id,
                title: 'Membership Update',
                message: `Dear ${student.name}, your membership application has been reviewed.`,
                type: 'rejection'
            });
            
            res.json({ 
                success: true, 
                message: 'Student rejected successfully! Email sent to user.',
                emailSent: true 
            });
            
        } else {
            res.status(400).json({ 
                success: false, 
                error: 'Invalid action. Use "approve" or "reject"' 
            });
        }
    } catch (error) {
        console.error('Error in handleStudentAction:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error while processing request' 
        });
    }
};

// ✅ Get single student by ID
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        
        if (student.status !== 'approved') {
            return res.status(403).json({
                success: false,
                error: 'This profile is not publicly available'
            });
        }
        
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Invalid student ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Server error while fetching student'
        });
    }
};



module.exports = { 
    applyForMembership, 
    getMyStatus, 
    getApprovedStudents,
    handleStudentAction,
    getStudentById
};