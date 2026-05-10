const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const { applyForMembership, getMyStatus, getApprovedStudents , getStudentById} = require('../controllers/studentController');

const Student = require('../models/Student'); 

router.post('/apply', upload.single('photo'), applyForMembership);
router.get('/status', getMyStatus);
router.get('/approved', getApprovedStudents);
router.get('/:id', getStudentById); 

 
// Add this route to update social links (with authentication)
router.put('/:id/social-links', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { socialLinks } = req.body;
        const userEmail = req.userEmail;
        
        // Find the student
        const student = await Student.findById(id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        
        // Check authorization
        if (student.email.toLowerCase().trim() !== userEmail) {
            return res.status(403).json({
                success: false,
                error: 'You can only update your own social links'
            });
        }
        
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { socialLinks: socialLinks },
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            message: 'Social links updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        console.error('Error updating social links:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update social links'
        });
    }
});

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }
        
        const student = await Student.findOne({ 
            email: email.toLowerCase(),
            status: 'approved'
        });
        
        if (student) {
            return res.json({
                success: true,
                message: 'Email verified successfully',
                data: { name: student.name, roll: student.roll }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: 'Email not found or not approved yet'
            });
        }
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during verification'
        });
    }
});

// Add this route to update complete profile
router.put('/update-profile/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            skills, 
            currentJob, 
            bio,
            phone,
            district,
            bloodGroup,
            socialLinks
        } = req.body;
        
        const userEmail = req.userEmail;
        
        const student = await Student.findById(id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        
        const dbEmail = student.email.toLowerCase().trim();
        
        if (dbEmail !== userEmail) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You can only update your own profile'
            });
        }
        
        const updateData = {};
        if (skills !== undefined) updateData.skills = skills;
        if (currentJob !== undefined) updateData.currentJob = currentJob;
        if (bio !== undefined) updateData.bio = bio;
        if (phone !== undefined) updateData.phone = phone;
        if (district !== undefined) updateData.district = district;
        if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
        
        if (socialLinks) {
            if (socialLinks.facebook !== undefined) updateData['socialLinks.facebook'] = socialLinks.facebook;
            if (socialLinks.linkedin !== undefined) updateData['socialLinks.linkedin'] = socialLinks.linkedin;
            if (socialLinks.github !== undefined) updateData['socialLinks.github'] = socialLinks.github;
            if (socialLinks.portfolio !== undefined) updateData['socialLinks.portfolio'] = socialLinks.portfolio;
            if (socialLinks.twitter !== undefined) updateData['socialLinks.twitter'] = socialLinks.twitter;
            if (socialLinks.instagram !== undefined) updateData['socialLinks.instagram'] = socialLinks.instagram;
        }
        
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedStudent
        });
        
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Server error while updating profile'
        });
    }
});

module.exports = router;