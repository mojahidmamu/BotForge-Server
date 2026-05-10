const mongoose = require('mongoose');

const adminOTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // 5 মিনিট
});

module.exports = mongoose.model('AdminOTP', adminOTPSchema);