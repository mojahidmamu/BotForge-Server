require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const nodemailer = require('nodemailer');


const adminRoutes = require('./routes/adminRoutes');
// ngrok config add-authtoken 3CNe84vmjDMKB3rOM650ZPDTnGR_2dpKLRhFc17Hfii4rNXVa
// https://despite-gainfully-boxlike.ngrok-free.dev/

// live link: https://despite-gainfully-boxlike.ngrok-free.dev/
//  ngrok http 5000
 
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'abdullahallmojahidstudent@gmail.com',
        pass: process.env.EMAIL_PASS , 
    }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

//  Mail : 
app.post('/api/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;

     // Validate input
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }


    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: 'abdullahallmojahidstudent@gmail.com',
        subject: `Contact Form: ${subject}`,
        replyTo: email,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #667eea; }
            .value { margin-top: 5px; padding: 10px; background: white; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
                <h2>New Message from BSPI Robotics Club</h2>
            </div>
            <div class="content">
                <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
                </div>
                <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
                </div>
                <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
                </div>
                <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
            <div class="footer">
                <p>This message was sent from your website contact form.</p>
                <p>Reply directly to ${email} to respond to this user.</p>
            </div>
            </div>
        </body>
        </html>
        `,
        text: `
        📧 NEW MESSAGE FROM BSPI ROBOTICS CLUB

        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
        ---
        This message was sent from your website contact form.
        Reply directly to ${email} to respond to this user.
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent from ${name} (${email})`);
        res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully!' 
        });
    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send email. Please try again later.' 
        });
    }
});

// Routes
app.use('/api/students', require('./routes/studentRoutes'));
 
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Student Management API is running!' });
});

// Test email endpoint 
app.post('/api/test-email', async (req, res) => {
    try {
        const testStudent = {
            name: 'Test User',
            email: 'test@example.com',
            roll: '12345',
            department: 'CST',
            session: '2023-24'
        };
        
        await sendStatusEmail(testStudent, 'approved');
        res.json({ success: true, message: 'Test email sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // এই লাইনটা গুরুত্বপূর্ণ!
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ API: http://localhost:${PORT}/api`);
    console.log(`✅ Email configured for: abdullahallmojahidstudent@gmail.com`);
    console.log(`✅ Network access: http://192.168.1.100:${PORT}`);
});