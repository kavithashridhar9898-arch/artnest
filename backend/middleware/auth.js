/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Verify JWT token from request headers
 * Adds user data to req.user if valid
 */
const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token.'
                });
            }

            // Add user data to request
            req.user = decoded;
            console.log('✅ Token verified for user:', decoded.userId);
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

/**
 * Check if user is an artist
 */
const isArtist = (req, res, next) => {
    if (req.user && req.user.userType === 'artist') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Artist account required.'
        });
    }
};

/**
 * Check if user is a venue owner
 */
const isVenue = (req, res, next) => {
    if (req.user && req.user.userType === 'venue') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Venue account required.'
        });
    }
};

/**
 * Optional authentication
 * Verifies token if present, but doesn't block request if not
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            // No token, continue without user data
            req.user = null;
            return next();
        }

        // Verify token if present
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Invalid token, continue without user data
                req.user = null;
            } else {
                // Valid token, add user data
                req.user = decoded;
            }
            next();
        });
    } catch (error) {
        console.error('Optional auth error:', error);
        req.user = null;
        next();
    }
};

module.exports = {
    verifyToken,
    isArtist,
    isVenue,
    optionalAuth
};
