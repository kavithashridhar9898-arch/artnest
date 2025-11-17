/**
 * Venue Controller
 * Handles venue profile management and search
 */

const db = require('../config/db');

const getAllVenues = async (req, res) => {
    try {
        const { type, city, minCapacity, maxCapacity, search } = req.query;
        
        let query = `
            SELECT u.id, u.full_name, u.profile_pic, u.is_verified,
                   vp.venue_name, vp.venue_type, vp.address, vp.city, vp.state, 
                   vp.capacity, vp.price_per_day, vp.rating, vp.total_bookings,
                   vp.sound_system, vp.lighting_system, vp.parking_available
            FROM users u
            INNER JOIN venue_profiles vp ON u.id = vp.user_id
            WHERE u.user_type = 'venue'
        `;
        
        const params = [];
        
        if (type) {
            query += ` AND vp.venue_type LIKE ?`;
            params.push(`%${type}%`);
        }
        
        if (city) {
            query += ` AND vp.city LIKE ?`;
            params.push(`%${city}%`);
        }
        
        if (search) {
            query += ` AND (vp.venue_name LIKE ? OR vp.city LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY vp.rating DESC, vp.total_bookings DESC`;
        
        const [venues] = await db.query(query, params);
        
        res.json({
            success: true,
            count: venues.length,
            data: venues
        });
    } catch (error) {
        console.error('Get venues error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching venues'
        });
    }
};

const getVenueById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [venues] = await db.query(`
            SELECT u.id, u.email, u.full_name, u.phone, u.profile_pic, u.cover_photo, u.is_verified,
                   vp.venue_name, vp.venue_type, vp.address, vp.city, vp.state, vp.capacity,
                   vp.amenities, vp.price_per_day, vp.sound_system, vp.lighting_system,
                   vp.backstage_area, vp.parking_available, vp.rating, vp.total_bookings
            FROM users u
            INNER JOIN venue_profiles vp ON u.id = vp.user_id
            WHERE u.id = ? AND u.user_type = 'venue'
        `, [id]);
        
        if (venues.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }
        
        res.json({
            success: true,
            data: venues[0]
        });
    } catch (error) {
        console.error('Get venue error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching venue'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            fullName, phone, venueName, venueType, address, city, state, bio,
            capacity, amenities, pricePerDay, soundSystem, lightingSystem,
            backstageArea, parkingAvailable
        } = req.body;
        
        // Update users table (only if values provided)
        const userUpdates = [];
        const userValues = [];
        
        if (fullName !== undefined) {
            userUpdates.push('full_name = ?');
            userValues.push(fullName);
        }
        if (phone !== undefined) {
            userUpdates.push('phone = ?');
            userValues.push(phone);
        }
        
        if (userUpdates.length > 0) {
            userValues.push(userId);
            await db.query(
                `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`,
                userValues
            );
        }
        
        // Update venue_profiles table (only if values provided)
        const profileUpdates = [];
        const profileValues = [];
        
        if (venueName !== undefined) {
            profileUpdates.push('venue_name = ?');
            profileValues.push(venueName);
        }
        if (venueType !== undefined) {
            profileUpdates.push('venue_type = ?');
            profileValues.push(venueType);
        }
        if (bio !== undefined) {
            profileUpdates.push('bio = ?');
            profileValues.push(bio);
        }
        if (address !== undefined) {
            profileUpdates.push('address = ?');
            profileValues.push(address);
        }
        if (city !== undefined) {
            profileUpdates.push('city = ?');
            profileValues.push(city);
        }
        if (state !== undefined) {
            profileUpdates.push('state = ?');
            profileValues.push(state);
        }
        if (capacity !== undefined) {
            profileUpdates.push('capacity = ?');
            profileValues.push(capacity);
        }
        if (amenities !== undefined) {
            profileUpdates.push('amenities = ?');
            profileValues.push(amenities);
        }
        if (pricePerDay !== undefined) {
            profileUpdates.push('price_per_day = ?');
            profileValues.push(pricePerDay);
        }
        if (soundSystem !== undefined) {
            profileUpdates.push('sound_system = ?');
            profileValues.push(soundSystem);
        }
        if (lightingSystem !== undefined) {
            profileUpdates.push('lighting_system = ?');
            profileValues.push(lightingSystem);
        }
        if (backstageArea !== undefined) {
            profileUpdates.push('backstage_area = ?');
            profileValues.push(backstageArea);
        }
        if (parkingAvailable !== undefined) {
            profileUpdates.push('parking_available = ?');
            profileValues.push(parkingAvailable);
        }
        
        if (profileUpdates.length > 0) {
            profileValues.push(userId);
            await db.query(
                `UPDATE venue_profiles SET ${profileUpdates.join(', ')} WHERE user_id = ?`,
                profileValues
            );
        }
        
        console.log('✅ Venue profile updated:', userId);
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update venue profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

const getGallery = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [media] = await db.query(`
            SELECT id, media_type, file_url, thumbnail_url, title, description, 
                   likes_count, views_count, created_at
            FROM media_posts
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [id]);
        
        res.json({
            success: true,
            count: media.length,
            data: media
        });
    } catch (error) {
        console.error('Get gallery error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching gallery'
        });
    }
};

const getReviews = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [reviews] = await db.query(`
            SELECT r.id, r.rating, r.review_text, r.created_at,
                   u.full_name as reviewer_name, u.profile_pic as reviewer_pic
            FROM reviews r
            INNER JOIN users u ON r.reviewer_id = u.id
            WHERE r.reviewed_id = ?
            ORDER BY r.created_at DESC
        `, [id]);
        
        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews'
        });
    }
};

module.exports = {
    getAllVenues,
    getVenueById,
    updateProfile,
    getGallery,
    getReviews
};
