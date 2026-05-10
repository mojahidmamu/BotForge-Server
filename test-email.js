// require('dotenv').config();
// const nodemailer = require('nodemailer');

// async function testEmail() {
//     console.log('Testing email with credentials:');
//     console.log('EMAIL_USER:', process.env.EMAIL_USER);
//     console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
    
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//     });
    
//     try {
//         await transporter.verify();
//         console.log('✅ SMTP connection successful!');
        
//         // টেস্ট ইমেইল পাঠান
//         const info = await transporter.sendMail({
//             from: `"Test" <${process.env.EMAIL_USER}>`,
//             to: process.env.ADMIN_EMAILS,
//             subject: 'Test Email',
//             text: 'This is a test email from BSPI BotForge'
//         });
//         console.log('✅ Test email sent!', info.messageId);
//     } catch (error) {
//         console.log('❌ Error:', error.message);
//     }
// }

// testEmail();