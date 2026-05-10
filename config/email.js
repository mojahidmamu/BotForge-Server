const nodemailer = require('nodemailer');
require('dotenv').config();


// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email error:', error.message);
    } else {
        console.log('✅ Email server ready');
    }
});

// Send email function
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"BSPI Robotics Club" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`✅ Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return false;
    }
};

// const sendEmail = async (to, subject, html) => {
//     try {
//         await transporter.sendMail({
//             from: `"Student Management" <${process.env.EMAIL_USER}>`,
//             to,
//             subject,
//             html
//         });
//         return true;
//     } catch (error) {
//         console.error('Email error:', error);
//         return false;
//     }
// };

// ✅ Admin notification when new application submitted
const sendAdminNotificationEmail = async (userData) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head><style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: auto; padding: 20px; background: #f4f4f4; }
            .header { background: #667eea; color: white; padding: 15px; text-align: center; }
            .content { background: white; padding: 20px; border-radius: 5px; }
            .button { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style></head>
        <body>
            <div class="container">
                <div class="header"><h2>🔔 New Membership Application</h2></div>
                <div class="content">
                    <p><strong>Name:</strong> ${userData.name}</p>
                    <p><strong>Email:</strong> ${userData.email}</p>
                    <p><strong>Roll:</strong> ${userData.roll}</p>
                    <p><strong>Department:</strong> ${userData.department}</p>
                    <p><strong>Session:</strong> ${userData.session}</p>
                    <p><strong>CGPA:</strong> ${userData.cgpa}</p>
                    <a href="http://localhost:5173/admin/pending" class="button">Review Application</a>
                </div>
            </div>
        </body>
        </html>
    `;
    return await sendEmail(process.env.ADMIN_EMAILS, '🔔 New Membership Application!', html);
};

// ✅ Approval email to user
const sendApprovalEmail = async (email, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head><style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: auto; padding: 20px; background: #f4f4f4; }
            .header { background: #28a745; color: white; padding: 15px; text-align: center; }
            .content { background: white; padding: 20px; border-radius: 5px; }
        </style></head>
        <body>
            <div class="container">
                <div class="header"><h2>✅ Membership Approved!</h2></div>
                <div class="content">
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>Congratulations! Your membership request has been <strong>APPROVED</strong>.</p>
                    <p>Welcome to BSPI Robotics Club! You can now access member features.</p>
                    <a href="http://localhost:5173/members" class="button">View Members</a>
                </div>
            </div>
        </body>
        </html>
    `;
    return await sendEmail(email, '🎉 Membership Approved!', html);
};

// ✅ Rejection email to user
const sendRejectionEmail = async (email, name, reason) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head><style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: auto; padding: 20px; background: #f4f4f4; }
            .header { background: #dc3545; color: white; padding: 15px; text-align: center; }
            .content { background: white; padding: 20px; border-radius: 5px; }
            .reason { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style></head>
        <body>
            <div class="container">
                <div class="header"><h2>Membership Update</h2></div>
                <div class="content">
                    <p>Dear <strong>${name}</strong>,</p>
                    <p>Thank you for your interest. Unfortunately, your membership request has been <strong>REJECTED</strong>.</p>
                    ${reason ? `<div class="reason"><strong>Reason:</strong> ${reason}</div>` : ''}
                    <p>You may reapply after addressing the issues.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    return await sendEmail(email, '📝 Membership Application Update', html);
};

// ✅ অ্যাডমিন লগইন ক্যাপচা কোড ইমেইল
// const sendAdminLoginCode = async (email, code) => {
//     const html = `
//         <!DOCTYPE html>
//         <html>
//         <head>
//             <style>
//                 body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
//                 .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px; border-radius: 10px; }
//                 .content { background: white; padding: 30px; border-radius: 8px; text-align: center; }
//                 .header h2 { color: #667eea; margin: 0; }
//                 .code-box { background: #f0f0f0; padding: 20px; font-size: 32px; letter-spacing: 10px; font-weight: bold; border-radius: 10px; margin: 20px 0; }
//                 .warning { color: #dc3545; font-size: 12px; margin-top: 20px; }
//                 .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
//             </style>
//         </head>
//         <body>
//             <div class="container">
//                 <div class="content">
//                     <div class="header">
//                         <h2>🔐 Admin Login Verification</h2>
//                     </div>
//                     <p>Your security code for admin panel access is:</p>
//                     <div class="code-box">${code}</div>
//                     <p><strong>This code will expire in 5 minutes.</strong></p>
//                     <p>If you didn't request this, please ignore this email.</p>
//                     <div class="warning">
//                         ⚠️ Never share this code with anyone!
//                     </div>
//                     <div class="footer">
//                         <p>BSPI Robotics Club - Admin Security</p>
//                     </div>
//                 </div>
//             </div>
//         </body>
//         </html>
//     `;
//     return await sendEmail(email, '🔐 Admin Login Security Code', html);
// };

// ✅ নতুন অ্যাডমিন যোগ করার নোটিফিকেশন
const sendNewAdminNotification = async (email, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; }
                .container { max-width: 600px; margin: auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { background: #f9f9f9; padding: 20px; }
                .button { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🎉 Welcome to Admin Panel!</h2>
                </div>
                <div class="content">
                    <p>Dear <strong>${name || email.split('@')[0]}</strong>,</p>
                    <p>You have been added as an administrator of <strong>BSPI Robotics Club</strong>.</p>
                    <p>You can now access the admin panel using your email address.</p>
                    <center>
                        <a href="http://localhost:5173/contribute/admin" class="button">Access Admin Panel</a>
                    </center>
                    <p style="margin-top: 20px;">When you login, a security code will be sent to this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;
    return await sendEmail(email, '🎉 You are now an Admin!', html);
};

// ✅ অ্যাডমিন লগইন কোড ইমেইল (নাম সহ)
const sendAdminLoginCode = async (email, code, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; }
                .container { max-width: 600px; margin: auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .code-box { background: #f0f0f0; padding: 20px; font-size: 32px; letter-spacing: 10px; font-weight: bold; text-align: center; border-radius: 10px; margin: 20px 0; }
                .warning { color: #dc3545; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>🔐 Admin Login Verification</h2>
                </div>
                <div class="content">
                    <p>Dear <strong>${name || email.split('@')[0]}</strong>,</p>
                    <p>Your security code for admin panel access is:</p>
                    <div class="code-box">${code}</div>
                    <p>This code will expire in <strong>5 minutes</strong>.</p>
                    <div class="warning">
                        ⚠️ Never share this code with anyone!
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    return await sendEmail(email, '🔐 Admin Login Security Code', html);
};


module.exports = {sendAdminNotificationEmail,  sendApprovalEmail, sendRejectionEmail , sendAdminLoginCode, sendNewAdminNotification};