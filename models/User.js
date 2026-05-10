const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: false, unique: true }, // Firebase UID
    email: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    photoURL: { type: String, default: '' },
    role: { 
        type: String, 
        enum: ['user', 'admin', 'super_admin'], 
        default: 'user' 
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);