const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Personal Info
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: { 
        type: String, 
        required: true,
        match: [/^01[0-9]{9}$/, 'Please use valid Bangladeshi phone number']
    },
    photo: { type: String, default: '' },
    photoPublicId: { type: String, default: '' },

    // ✅ Social Links (single clean structure)
    socialLinks: {
        facebook: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' }
    },

    // Academic Info
    roll: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    registration: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    department: { 
        type: String, 
        enum: ['CST', 'MT', 'ET', 'AT', 'CWT', 'CONT'],
        required: true 
    },
    session: { 
        type: String, 
        required: true 
    },
    cgpa: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 4 
    },

    // Additional Info
    district: { 
        type: String, 
        required: true,
        trim: true
    },
    currentJob: { type: String, default: '' },
    skills: { 
        type: String, 
        required: true 
    },

    role: { 
        type: String, 
        enum: ['student', 'executive', 'teacher'], 
        default: 'student' 
    },

    bloodGroup: { 
        type: String, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: '' 
    },

    // Status
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    rejectionReason: { type: String, default: '' },

    // Timestamps
    appliedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    rejectedAt: Date
});

// 🔍 Search Index
studentSchema.index({ name: 'text', skills: 'text' });

module.exports = mongoose.model('Student', studentSchema);