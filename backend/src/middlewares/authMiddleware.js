const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyToken = (req, res, next) => {
    // Log origin information for CORS debugging
    console.log('Request origin:', req.headers.origin);
    console.log('Request from:', req.ip);
    
    const authHeader = req.headers['authorization'];
    console.log('Auth header received:', authHeader);
    
    // Special handling for OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        return next();
    }
    
    // Make sure authorization header exists and is properly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Auth error: Invalid authorization header');
        return res.status(401).json({ message: 'Invalid authorization header format' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        console.log('Auth error: No token provided');
        return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Token received:', token.substring(0, 10) + '...');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log('Auth error: Token verification failed', err.message);
            return res.status(401).json({ message: 'Unauthorized', error: err.message });
        }

        try {
            console.log('Token decoded:', decoded);
            const user = await User.findById(decoded.id || decoded._id); // support both
            if (!user) {
                console.log('Auth error: User not found for ID:', decoded.id || decoded._id);
                return res.status(404).json({ message: 'User not found' });
            }
            // Block access for inactive/blocked users (all roles)
            if (
                user.status === 'inactive' || user.status === 'blocked'
            ) {
                console.log('Auth error: User is blocked/inactive:', user._id);
                return res.status(403).json({ message: 'Your account is blocked' });
            }
            req.user = user;
            req.user.id = user._id; // ensure id is always available
            console.log('Auth success: User authenticated', { id: user._id, role: user.role });
            next();
        } catch (error) {
            console.log('Auth error: Server error', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    checkRole,
};