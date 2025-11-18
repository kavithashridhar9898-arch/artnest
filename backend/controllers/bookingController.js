/**
 * Booking Controller
 * Handles booking requests between artists and venues
 */

const db = require('../config/db');

const createBookingRequest = async (req, res) => {
    try {
        const senderId = req.user.userId;
        const {
            receiverId, requestType, eventDate, eventTime, durationHours,
            budget, eventType, specialRequirements, message
        } = req.body;

        if (!receiverId || !eventDate) {
            return res.status(400).json({
                success: false,
                message: 'Receiver ID and event date are required'
            });
        }

        const result = await db.query(`
            INSERT INTO booking_requests 
            (request_type, sender_id, receiver_id, event_date, event_time, 
             duration_hours, budget, event_type, special_requirements, message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
        `, [requestType, senderId, receiverId, eventDate, eventTime, 
            durationHours, budget, eventType, specialRequirements, message]);

        // Create notification for receiver
        await db.query(`
            INSERT INTO notifications (user_id, type, title, message, related_id)
            VALUES ($1, 'booking_request', 'New Booking Request', $2, $3)
        `, [receiverId, `You have a new booking request for ${eventDate}`, result.rows[0].id]);

        console.log('✅ Booking request created:', result.rows[0].id);

        res.status(201).json({
            success: true,
            message: 'Booking request sent successfully',
            data: { bookingId: result.rows[0].id }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating booking request'
        });
    }
};

const getSentRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const bookings = await db.query(`
            SELECT br.*, 
                   u.full_name as receiver_name, u.profile_pic as receiver_pic, u.user_type as receiver_type
            FROM booking_requests br
            INNER JOIN users u ON br.receiver_id = u.id
            WHERE br.sender_id = $1
            ORDER BY br.created_at DESC
        `, [userId]);

        res.json({
            success: true,
            count: bookings.rows.length,
            data: bookings.rows
        });
    } catch (error) {
        console.error('Get sent requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sent requests'
        });
    }
};

const getReceivedRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const bookings = await db.query(`
            SELECT br.*, 
                   u.full_name as sender_name, u.profile_pic as sender_pic, u.user_type as sender_type
            FROM booking_requests br
            INNER JOIN users u ON br.sender_id = u.id
            WHERE br.receiver_id = $1
            ORDER BY br.created_at DESC
        `, [userId]);

        res.json({
            success: true,
            count: bookings.rows.length,
            data: bookings.rows
        });
    } catch (error) {
        console.error('Get received requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching received requests'
        });
    }
};

const acceptBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await db.query(`
            UPDATE booking_requests 
            SET status = 'accepted'
            WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
        `, [id, userId]);

        // Get booking details
        const bookings = await db.query('SELECT sender_id, receiver_id FROM booking_requests WHERE id = $1', [id]);
        
        if (bookings.rows.length > 0) {
            const senderId = bookings.rows[0].sender_id;
            const receiverId = bookings.rows[0].receiver_id;

            // Create notification
            await db.query(`
                INSERT INTO notifications (user_id, type, title, message, related_id)
                VALUES ($1, 'booking_accepted', 'Booking Accepted', 'Your booking request has been accepted!', $2)
            `, [senderId, id]);

            // Create or get conversation between the two users
            const existingConv = await db.query(`
                SELECT id FROM chat_conversations
                WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $3 AND user2_id = $4)
            `, [senderId, receiverId, receiverId, senderId]);

            if (existingConv.rows.length === 0) {
                // Create new conversation
                await db.query(`
                    INSERT INTO chat_conversations (user1_id, user2_id, last_message, last_message_time)
                    VALUES ($1, $2, 'Booking accepted - You can now chat!', CURRENT_TIMESTAMP)
                `, [senderId, receiverId]);
                
                console.log('✅ Chat conversation created for accepted booking');
            }
        }

        res.json({
            success: true,
            message: 'Booking accepted successfully'
        });
    } catch (error) {
        console.error('Accept booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error accepting booking'
        });
    }
};

const rejectBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await db.query(`
            UPDATE booking_requests 
            SET status = 'rejected'
            WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
        `, [id, userId]);

        const bookings = await db.query('SELECT sender_id FROM booking_requests WHERE id = $1', [id]);
        
        if (bookings.rows.length > 0) {
            await db.query(`
                INSERT INTO notifications (user_id, type, title, message, related_id)
                VALUES ($1, 'booking_rejected', 'Booking Declined', 'Your booking request was declined.', $2)
            `, [bookings.rows[0].sender_id, id]);
        }

        res.json({
            success: true,
            message: 'Booking rejected'
        });
    } catch (error) {
        console.error('Reject booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting booking'
        });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await db.query(`
            UPDATE booking_requests 
            SET status = 'cancelled'
            WHERE id = $1 AND sender_id = $2
        `, [id, userId]);

        res.json({
            success: true,
            message: 'Booking cancelled'
        });
    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking'
        });
    }
};

const completeBooking = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`
            UPDATE booking_requests 
            SET status = 'completed'
            WHERE id = $1
        `, [id]);

        res.json({
            success: true,
            message: 'Booking marked as completed'
        });
    } catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing booking'
        });
    }
};

const addReview = async (req, res) => {
    try {
        const { id } = req.params;
        const reviewerId = req.user.userId;
        const { rating, reviewText } = req.body;

        // Get booking details
        const bookings = await db.query(`
            SELECT sender_id, receiver_id FROM booking_requests WHERE id = $1
        `, [id]);

        if (bookings.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        const reviewedId = bookings.rows[0].sender_id === reviewerId ? 
            bookings.rows[0].receiver_id : bookings.rows[0].sender_id;

        await db.query(`
            INSERT INTO reviews (reviewer_id, reviewed_id, booking_id, rating, review_text)
            VALUES ($1, $2, $3, $4, $5)
        `, [reviewerId, reviewedId, id, rating, reviewText]);

        // Update average rating
        const avgRating = await db.query(`
            SELECT AVG(rating) as avg_rating FROM reviews WHERE reviewed_id = $1
        `, [reviewedId]);

        const userType = await db.query('SELECT user_type FROM users WHERE id = $1', [reviewedId]);

        if (userType.rows[0].user_type === 'artist') {
            await db.query('UPDATE artist_profiles SET rating = $1 WHERE user_id = $2', 
                [avgRating.rows[0].avg_rating, reviewedId]);
        } else {
            await db.query('UPDATE venue_profiles SET rating = $1 WHERE user_id = $2', 
                [avgRating.rows[0].avg_rating, reviewedId]);
        }

        res.json({
            success: true,
            message: 'Review added successfully'
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding review'
        });
    }
};

module.exports = {
    createBookingRequest,
    getSentRequests,
    getReceivedRequests,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    completeBooking,
    addReview
};
