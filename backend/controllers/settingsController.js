const db = require('../config/db');

// Get user settings
const getSettings = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [settings] = await db.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );

        if (settings.length === 0) {
            // Return default settings if none exist
            return res.json({
                success: true,
                data: {
                    notify_booking_requests: true,
                    notify_booking_confirmations: true,
                    notify_messages: true,
                    notify_reviews: true,
                    notify_marketing: false,
                    public_profile: true,
                    show_email: false,
                    show_phone: false,
                    show_online_status: true,
                    language: 'en',
                    timezone: 'UTC',
                    dark_mode: true,
                    enable_animations: true,
                    two_factor_enabled: false
                }
            });
        }

        res.json({
            success: true,
            data: settings[0]
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get settings'
        });
    }
};

// Update user settings
const updateSettings = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            notify_booking_requests,
            notify_booking_confirmations,
            notify_messages,
            notify_reviews,
            notify_marketing,
            public_profile,
            show_email,
            show_phone,
            show_online_status,
            language,
            timezone,
            dark_mode,
            enable_animations,
            two_factor_enabled
        } = req.body;

        // Check if settings exist
        const [existing] = await db.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );

        const updates = [];
        const values = [];

        // Build dynamic update query
        if (notify_booking_requests !== undefined) {
            updates.push('notify_booking_requests = ?');
            values.push(notify_booking_requests);
        }
        if (notify_booking_confirmations !== undefined) {
            updates.push('notify_booking_confirmations = ?');
            values.push(notify_booking_confirmations);
        }
        if (notify_messages !== undefined) {
            updates.push('notify_messages = ?');
            values.push(notify_messages);
        }
        if (notify_reviews !== undefined) {
            updates.push('notify_reviews = ?');
            values.push(notify_reviews);
        }
        if (notify_marketing !== undefined) {
            updates.push('notify_marketing = ?');
            values.push(notify_marketing);
        }
        if (public_profile !== undefined) {
            updates.push('public_profile = ?');
            values.push(public_profile);
        }
        if (show_email !== undefined) {
            updates.push('show_email = ?');
            values.push(show_email);
        }
        if (show_phone !== undefined) {
            updates.push('show_phone = ?');
            values.push(show_phone);
        }
        if (show_online_status !== undefined) {
            updates.push('show_online_status = ?');
            values.push(show_online_status);
        }
        if (language !== undefined) {
            updates.push('language = ?');
            values.push(language);
        }
        if (timezone !== undefined) {
            updates.push('timezone = ?');
            values.push(timezone);
        }
        if (dark_mode !== undefined) {
            updates.push('dark_mode = ?');
            values.push(dark_mode);
        }
        if (enable_animations !== undefined) {
            updates.push('enable_animations = ?');
            values.push(enable_animations);
        }
        if (two_factor_enabled !== undefined) {
            updates.push('two_factor_enabled = ?');
            values.push(two_factor_enabled);
        }

        updates.push('updated_at = NOW()');

        if (existing.length === 0) {
            // Insert new settings
            await db.query(
                `INSERT INTO user_settings (
                    user_id, 
                    notify_booking_requests, 
                    notify_booking_confirmations, 
                    notify_messages, 
                    notify_reviews, 
                    notify_marketing,
                    public_profile,
                    show_email,
                    show_phone,
                    show_online_status,
                    language,
                    timezone,
                    dark_mode,
                    enable_animations,
                    two_factor_enabled
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    notify_booking_requests ?? true,
                    notify_booking_confirmations ?? true,
                    notify_messages ?? true,
                    notify_reviews ?? true,
                    notify_marketing ?? false,
                    public_profile ?? true,
                    show_email ?? false,
                    show_phone ?? false,
                    show_online_status ?? true,
                    language || 'en',
                    timezone || 'UTC',
                    dark_mode ?? true,
                    enable_animations ?? true,
                    two_factor_enabled ?? false
                ]
            );
        } else {
            // Update existing settings
            if (updates.length > 1) { // More than just updated_at
                values.push(userId);
                await db.query(
                    `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`,
                    values
                );
            }
        }

        // Get updated settings
        const [updatedSettings] = await db.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: updatedSettings[0]
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
};

// Delete user account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Verify password
        const bcrypt = require('bcrypt');
        const [users] = await db.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isValidPassword = await bcrypt.compare(password, users[0].password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Delete user data in order (respecting foreign keys)
        await db.query('DELETE FROM chat_messages WHERE sender_id = ? OR receiver_id = ?', [userId, userId]);
        await db.query('DELETE FROM chat_conversations WHERE user1_id = ? OR user2_id = ?', [userId, userId]);
        await db.query('DELETE FROM booking_requests WHERE venue_id = ? OR artist_id = ?', [userId, userId]);
        await db.query('DELETE FROM user_settings WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM artist_profiles WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM venue_profiles WHERE user_id = ?', [userId]);
        await db.query('DELETE FROM users WHERE id = ?', [userId]);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    deleteAccount
};
