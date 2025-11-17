/**
 * Authentication Routes
 * Handles user registration, login, and authentication
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (artist or venue)
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and return user data
 * @access  Protected
 */
router.get('/verify', verifyToken, authController.verifyToken);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, phone, profile picture)
 * @access  Private
 */
router.put('/profile', verifyToken, authController.updateUser);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', verifyToken, authController.changePassword);

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Delete user account permanently
 * @access  Private
 */
router.delete('/delete-account', verifyToken, require('../controllers/settingsController').deleteAccount);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Protected
 */
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
