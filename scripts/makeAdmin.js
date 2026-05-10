// // backend/scripts/makeAdmin.js
// const mongoose = require('mongoose'); 
// const User = require('../models/User');

// const makeAdmin = async () => {
//     await mongoose.connect('mongodb://localhost:27017/bspi_robotics');
    
//     await User.findOneAndUpdate(
//         { email: 'abdullahallmojahidstudent@gmail.com' }, // আপনার ইমেইল দিন
//         { role: 'super_admin', isAdmin: true },
//         { upsert: true }
//     );
    
//     console.log('Admin created successfully!');
//     process.exit();
// };

// makeAdmin();