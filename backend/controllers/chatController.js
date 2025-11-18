/**
 * Chat Controller
 * Handles chat conversations and messages
 */

const db = require('../config/db');

const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const conversations = await db.query(`
            SELECT cc.*,
                   CASE 
                       WHEN cc.user1_id = $1 THEN cc.user2_id
                       ELSE cc.user1_id
                   END as other_user_id,
                   CASE 
                       WHEN cc.user1_id = $2 THEN u2.full_name
                       ELSE u1.full_name
                   END as other_user_name,
                   CASE 
                       WHEN cc.user1_id = $3 THEN u2.profile_pic
                       ELSE u1.profile_pic
                   END as other_user_pic,
                   CASE 
                       WHEN cc.user1_id = $4 THEN u2.user_type
                       ELSE u1.user_type
                   END as other_user_type,
                   (SELECT COUNT(*) FROM chat_messages 
                    WHERE conversation_id = cc.id AND receiver_id = $5 AND is_read = false) as unread_count
            FROM chat_conversations cc
            INNER JOIN users u1 ON cc.user1_id = u1.id
            INNER JOIN users u2 ON cc.user2_id = u2.id
            WHERE cc.user1_id = $6 OR cc.user2_id = $7
            ORDER BY cc.last_message_time DESC
        `, [userId, userId, userId, userId, userId, userId, userId]);

        res.json({
            success: true,
            count: conversations.rows.length,
            data: conversations.rows
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations'
        });
    }
};

const getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { userId: otherUserId } = req.params;

        // Check if conversation exists
        const existing = await db.query(`
            SELECT * FROM chat_conversations
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $3 AND user2_id = $4)
        `, [userId, otherUserId, otherUserId, userId]);

        if (existing.rows.length > 0) {
            return res.json({
                success: true,
                data: existing.rows[0]
            });
        }

        // Create new conversation
        const result = await db.query(`
            INSERT INTO chat_conversations (user1_id, user2_id)
            VALUES ($1, $2)
            RETURNING id
        `, [userId, otherUserId]);

        const newConversation = await db.query(
            'SELECT * FROM chat_conversations WHERE id = $1',
            [result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            data: newConversation.rows[0]
        });
    } catch (error) {
        console.error('Get/create conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error with conversation'
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const messages = await db.query(`
            SELECT cm.id, cm.conversation_id, cm.sender_id, cm.receiver_id, 
                   cm.message as message_text, cm.message_type, cm.file_url, 
                   cm.is_read, cm.created_at,
                   u.full_name as sender_name, u.profile_pic as sender_pic
            FROM chat_messages cm
            INNER JOIN users u ON cm.sender_id = u.id
            WHERE cm.conversation_id = $1
            ORDER BY cm.created_at ASC
            LIMIT $2 OFFSET $3
        `, [conversationId, parseInt(limit), parseInt(offset)]);

        res.json({
            success: true,
            count: messages.rows.length,
            data: messages.rows
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const { conversation_id, receiver_id, message_text, message_type = 'text' } = req.body;

        if (!conversation_id || !receiver_id || !message_text) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const result = await db.query(`
            INSERT INTO chat_messages (conversation_id, sender_id, receiver_id, message, message_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [conversation_id, senderId, receiver_id, message_text, message_type]);

        // Update conversation last message
        await db.query(`
            UPDATE chat_conversations
            SET last_message = $1, last_message_time = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [message_text, conversation_id]);

        const newMessage = await db.query(
            'SELECT * FROM chat_messages WHERE id = $1',
            [result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            data: newMessage.rows[0]
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        await db.query(`
            UPDATE chat_messages
            SET is_read = true
            WHERE conversation_id = $1 AND receiver_id = $2 AND is_read = false
        `, [conversationId, userId]);

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking messages as read'
        });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await db.query(`
            SELECT COUNT(*) as unread_count
            FROM chat_messages
            WHERE receiver_id = $1 AND is_read = false
        `, [userId]);

        res.json({
            success: true,
            data: { unreadCount: result.rows[0].unread_count }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count'
        });
    }
};

module.exports = {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount
};
