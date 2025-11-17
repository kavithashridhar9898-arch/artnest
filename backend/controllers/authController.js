/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

/**
 * Register a new user (Artist or Venue)
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        console.log('📝 Registration attempt:', req.body.email);

        const { email, password, userType, fullName, phone } = req.body;

        // Validation
        if (!email || !password || !userType || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields.'
            });
        }

        // Validate user type
        if (userType !== 'artist' && userType !== 'venue') {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type. Must be "artist" or "venue".'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // Check if user already exists
        const [existingUsers] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Hash password
        const saltRounds = 10; // Reduced from 12 for faster performance
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const [result] = await db.query(
            'INSERT INTO users (email, password, user_type, full_name, phone) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, userType, fullName, phone || null]
        );

        const userId = result.insertId;

        // Create profile based on user type
        if (userType === 'artist') {
            await db.query(
                'INSERT INTO artist_profiles (user_id) VALUES (?)',
                [userId]
            );
        } else {
            await db.query(
                'INSERT INTO venue_profiles (user_id) VALUES (?)',
                [userId]
            );
        }

        console.log('✅ User registered successfully:', userId);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                userId: userId,
                email: email,
                userType: userType,
                fullName: fullName
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration.'
        });
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        console.log('🔐 Login attempt:', req.body.email);

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        // Find user
        const [users] = await db.query(
            'SELECT id, email, password, user_type, full_name, profile_pic FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Update last active
        await db.query(
            'UPDATE users SET last_active = NOW() WHERE id = ?',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                userType: user.user_type
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ Login successful:', user.id);

        res.json({
            success: true,
            message: 'Login successful!',
            data: {
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    userType: user.user_type,
                    profilePic: user.profile_pic
                }
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login.'
        });
    }
};

/**
 * Verify JWT token
 * GET /api/auth/verify
 */
const verifyToken = async (req, res) => {
    try {
        // Token is already verified by middleware
        const userId = req.user.userId;

        // Get user data
        const [users] = await db.query(
            'SELECT id, email, user_type, full_name, profile_pic FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const user = users[0];

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    userType: user.user_type,
                    profilePic: user.profile_pic
                }
            }
        });

    } catch (error) {
        console.error('❌ Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token verification.'
        });
    }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long.'
            });
        }

        // Get current password hash
        const [users] = await db.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await db.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        console.log('✅ Password changed for user:', userId);

        res.json({
            success: true,
            message: 'Password changed successfully!'
        });

    } catch (error) {
        console.error('❌ Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change.'
        });
    }
};

/**
 * Update user profile (name, phone, profile picture)
 * PUT /api/auth/profile
 */
const updateUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { fullName, phone, profilePic } = req.body;

        const updates = [];
        const values = [];

        if (fullName) {
            updates.push('full_name = ?');
            values.push(fullName);
        }

        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (profilePic !== undefined) {
            updates.push('profile_pic = ?');
            values.push(profilePic);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        values.push(userId);

        await db.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Get updated user data
        const [users] = await db.query(
            'SELECT id, email, user_type, full_name, phone, profile_pic FROM users WHERE id = ?',
            [userId]
        );

        console.log('✅ User profile updated:', userId);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                userId: users[0].id,
                email: users[0].email,
                fullName: users[0].full_name,
                phone: users[0].phone,
                userType: users[0].user_type,
                profilePic: users[0].profile_pic
            }
        });

    } catch (error) {
        console.error('❌ Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update.'
        });
    }
};

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        // JWT is stateless, so logout is handled client-side
        // But we can update last_active timestamp
        const userId = req.user.userId;

        await db.query(
            'UPDATE users SET last_active = NOW() WHERE id = ?',
            [userId]
        );

        console.log('✅ User logged out:', userId);

        res.json({
            success: true,
            message: 'Logout successful!'
        });

    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout.'
        });
    }
};

module.exports = {
    register,
    login,
    verifyToken,
    changePassword,
    updateUser,
    logout
};
