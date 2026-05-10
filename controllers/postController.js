const Post = require('../models/Post');
const cloudinary = require('../config/cloudinary');

// ✅ CREATE POST WITH IMAGE
const createPost = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }
        
        let imageUrl = '';
        let imagePublicId = '';
        
        // যদি ইমেজ থাকে
        if (req.file) {
            imageUrl = req.file.path;
            imagePublicId = req.file.filename;
        }
        
        const newPost = await Post.create({
            title,
            content,
            author: author || 'Anonymous',
            imageUrl,
            imagePublicId
        });
        
        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            data: newPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ GET ALL POSTS
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ GET SINGLE POST
const getSinglePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ UPDATE POST WITH IMAGE (পুরানো ইমেজ ডিলিট করে)
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author } = req.body;
        
        // প্রথমে পুরানো পোস্ট খুঁজে বের করি
        const existingPost = await Post.findById(id);
        
        if (!existingPost) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        let imageUrl = existingPost.imageUrl;
        let imagePublicId = existingPost.imagePublicId;
        
        // যদি নতুন ইমেজ আসে তাহলে পুরানো ইমেজ ডিলিট করি
        if (req.file) {
            // পুরানো ইমেজ ক্লাউড থেকে ডিলিট
            if (existingPost.imagePublicId) {
                await cloudinary.uploader.destroy(existingPost.imagePublicId);
                console.log('✅ Old image deleted from Cloudinary');
            }
            
            // নতুন ইমেজ সেট
            imageUrl = req.file.path;
            imagePublicId = req.file.filename;
        }
        
        // পোস্ট আপডেট
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                title: title || existingPost.title,
                content: content || existingPost.content,
                author: author || existingPost.author,
                imageUrl,
                imagePublicId,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );
        
        res.json({
            success: true,
            message: 'Post updated successfully',
            data: updatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ DELETE POST WITH IMAGE (ক্লাউড থেকেও ডিলিট)
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        // পোস্ট খুঁজে বের করি
        const post = await Post.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        // ক্লাউড থেকে ইমেজ ডিলিট
        if (post.imagePublicId) {
            await cloudinary.uploader.destroy(post.imagePublicId);
            console.log('✅ Image deleted from Cloudinary');
        }
        
        // ডাটাবেস থেকে পোস্ট ডিলিট
        await Post.findByIdAndDelete(id);
        
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ UPLOAD ONLY IMAGE (Extra endpoint)
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded'
            });
        }
        
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: req.file.path,
            imagePublicId: req.file.filename
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    uploadImage
};