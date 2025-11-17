const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

// Get all notifications for user
router.get('/', verifyToken, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', verifyToken, notificationController.markAsRead);

// Mark all as read
router.put('/mark-all-read', verifyToken, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;
