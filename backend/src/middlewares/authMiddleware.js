const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const user = await User.findById(decoded.id || decoded._id); // support both
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Block access for inactive/blocked users (all roles)
            if (
                user.status === 'inactive' || user.status === 'blocked'
            ) {
                return res.status(403).json({ message: 'Your account is blocked' });
            }
            req.user = user;
            req.user.id = user._id; // ensure id is always available
            next();
        } catch (error) {
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