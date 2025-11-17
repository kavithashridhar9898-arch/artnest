const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken } = require('../middleware/auth');

// Get user settings
router.get('/', verifyToken, settingsController.getSettings);

// Update user settings
router.put('/', verifyToken, settingsController.updateSettings);

module.exports = router;
