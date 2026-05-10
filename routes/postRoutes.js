const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    createPost,
    getAllPosts,
    getSinglePost,
    updatePost,
    deletePost,
    uploadImage
} = require('../controllers/postController');

// Public routes
router.get('/', getAllPosts);
router.get('/:id', getSinglePost);

// Image upload only
router.post('/upload-image', upload.single('image'), uploadImage);

// CRUD operations with image
router.post('/', upload.single('image'), createPost);
router.put('/:id', upload.single('image'), updatePost);
router.delete('/:id', deletePost);

module.exports = router;