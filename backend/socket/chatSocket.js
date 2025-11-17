/**
 * Socket.IO Chat Handler
 * Real-time chat functionality
 */

const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Initialize Socket.IO with authentication and event handlers
 */
const initializeSocket = (io) => {
    // Middleware for Socket.IO authentication
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return next(new Error('Authentication error: Invalid token'));
                }
                socket.userId = decoded.userId;
                socket.userEmail = decoded.email;
                console.log('✅ Socket authenticated:', decoded.userId);
                next();
            });
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    // Connection event
    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.userId);

        // User joins their personal room
        socket.join(`user_${socket.userId}`);

        // Broadcast online status
        socket.broadcast.emit('user_online', {
            userId: socket.userId,
            timestamp: new Date()
        });

        // Join conversation room
        socket.on('join_conversation', (data) => {
            const { conversationId } = data;
            socket.join(`conversation_${conversationId}`);
            console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        });

        // Leave conversation room
        socket.on('leave_conversation', (data) => {
            const { conversationId } = data;
            socket.leave(`conversation_${conversationId}`);
            console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });

        // Send message event
        socket.on('send_message', async (data) => {
            try {
                const { conversationId, receiverId, message, messageType = 'text', fileUrl = null } = data;
                const senderId = socket.userId;

                console.log('📨 Message from:', senderId, 'to:', receiverId);

                // Save message to database
                const [result] = await db.query(`
                    INSERT INTO chat_messages 
                    (conversation_id, sender_id, receiver_id, message, message_type, file_url)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [conversationId, senderId, receiverId, message, messageType, fileUrl]);

                // Update conversation last message
                await db.query(`
                    UPDATE chat_conversations
                    SET last_message = ?, last_message_time = NOW()
                    WHERE id = ?
                `, [message, conversationId]);

                // Get sender info
                const [users] = await db.query(
                    'SELECT full_name, profile_pic FROM users WHERE id = ?',
                    [senderId]
                );

                const messageData = {
                    id: result.insertId,
                    conversationId,
                    senderId,
                    receiverId,
                    message,
                    messageType,
                    fileUrl,
                    isRead: false,
                    createdAt: new Date(),
                    senderName: users[0].full_name,
                    senderPic: users[0].profile_pic
                };

                // Emit to conversation room
                io.to(`conversation_${conversationId}`).emit('receive_message', messageData);

                // Emit to receiver's personal room (for notification)
                io.to(`user_${receiverId}`).emit('new_message_notification', {
                    conversationId,
                    senderId,
                    senderName: users[0].full_name,
                    message: message.substring(0, 50)
                });

                console.log('✅ Message sent successfully');

            } catch (error) {
                console.error('❌ Send message error:', error);
                socket.emit('message_error', {
                    message: 'Failed to send message'
                });
            }
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { conversationId, receiverId } = data;
            io.to(`user_${receiverId}`).emit('user_typing', {
                conversationId,
                userId: socket.userId
            });
        });

        // Stop typing indicator
        socket.on('stop_typing', (data) => {
            const { conversationId, receiverId } = data;
            io.to(`user_${receiverId}`).emit('user_stop_typing', {
                conversationId,
                userId: socket.userId
            });
        });

        // Message read receipt
        socket.on('message_read', async (data) => {
            try {
                const { conversationId, messageId, senderId } = data;

                // Update message as read in database
                await db.query(
                    'UPDATE chat_messages SET is_read = TRUE WHERE id = ?',
                    [messageId]
                );

                // Notify sender
                io.to(`user_${senderId}`).emit('message_read_receipt', {
                    conversationId,
                    messageId,
                    readBy: socket.userId,
                    readAt: new Date()
                });

            } catch (error) {
                console.error('Message read error:', error);
            }
        });

        // Mark all messages in conversation as read
        socket.on('mark_conversation_read', async (data) => {
            try {
                const { conversationId } = data;
                const userId = socket.userId;

                await db.query(`
                    UPDATE chat_messages
                    SET is_read = TRUE
                    WHERE conversation_id = ? AND receiver_id = ? AND is_read = FALSE
                `, [conversationId, userId]);

                console.log(`✅ Conversation ${conversationId} marked as read by ${userId}`);

            } catch (error) {
                console.error('Mark conversation read error:', error);
            }
        });

        // Get online users (optional feature)
        socket.on('get_online_users', () => {
            const sockets = io.sockets.sockets;
            const onlineUsers = [];
            
            sockets.forEach((s) => {
                if (s.userId) {
                    onlineUsers.push(s.userId);
                }
            });

            socket.emit('online_users_list', {
                users: [...new Set(onlineUsers)] // Remove duplicates
            });
        });

        // Disconnect event
        socket.on('disconnect', () => {
            console.log('🔌 User disconnected:', socket.userId);
            
            // Broadcast offline status
            socket.broadcast.emit('user_offline', {
                userId: socket.userId,
                timestamp: new Date()
            });
        });

        // Error handling
        socket.on('error', (error) => {
            console.error('Socket error for user', socket.userId, ':', error);
        });
    });

    console.log('✅ Socket.IO initialized');
};

module.exports = initializeSocket;
