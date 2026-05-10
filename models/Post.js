const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minlength: [10, 'Content must be at least 10 characters']
    },
    author: {
        type: String,
        default: 'Anonymous'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    imagePublicId: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// আপডেটের সময় auto-update
postSchema.pre('findOneAndUpdate', function() {
    this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Post', postSchema);