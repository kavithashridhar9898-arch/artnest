/**
 * Chat Routes
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

router.get('/conversations', verifyToken, chatController.getConversations);
router.get('/conversation/:userId', verifyToken, chatController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', verifyToken, chatController.getMessages);
router.post('/messages', verifyToken, chatController.sendMessage);
router.put('/conversations/:conversationId/read', verifyToken, chatController.markAsRead);
router.get('/unread-count', verifyToken, chatController.getUnreadCount);

module.exports = router;
