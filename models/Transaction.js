const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, unique: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'pending' },
    user: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        roll: { type: String }
    },
    paymentMethod: { type: String, enum: ['bkash', 'nagad', 'rocket', 'bank', 'cash'], default: 'cash' },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Auto generate transaction ID
transactionSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);