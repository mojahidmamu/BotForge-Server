// middleware/auth.js
const authMiddleware = async (req, res, next) => {
    const userEmail = req.headers['x-user-email'];
    
    if (!userEmail) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized: No email provided'
        });
    }
    
    // Store normalized email in request
    req.userEmail = userEmail.toLowerCase().trim();
    next();
};

module.exports = authMiddleware;