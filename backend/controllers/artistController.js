/**
 * Artist Controller
 * Handles artist profile management and search
 */

const db = require('../config/db');

/**
 * Get all artists with optional filters
 * GET /api/artists
 */
const getAllArtists = async (req, res) => {
    try {
        const { genre, city, minPrice, maxPrice, minRating, search } = req.query;
        
        let query = `
            SELECT u.id, u.full_name, u.profile_pic, u.is_verified,
                   ap.stage_name, ap.genre, ap.bio, ap.experience_years, 
                   ap.price_range, ap.rating, ap.total_shows
            FROM users u
            INNER JOIN artist_profiles ap ON u.id = ap.user_id
            WHERE u.user_type = 'artist'
        `;
        
        const params = [];
        
        let paramIndex = 1;
        
        if (genre) {
            query += ` AND ap.genre LIKE $${paramIndex++}`;
            params.push(`%${genre}%`);
        }
        
        if (search) {
            query += ` AND (u.full_name LIKE $${paramIndex++} OR ap.stage_name LIKE $${paramIndex++} OR ap.genre LIKE $${paramIndex++})`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (minRating) {
            query += ` AND ap.rating >= $${paramIndex++}`;
            params.push(minRating);
        }
        
        query += ` ORDER BY ap.rating DESC, ap.total_shows DESC`;
        
        const artists = await db.query(query, params);
        
        res.json({
            success: true,
            count: artists.rows.length,
            data: artists.rows
        });
    } catch (error) {
        console.error('Get artists error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching artists'
        });
    }
};

/**
 * Get artist profile by ID
 * GET /api/artists/:id
 */
const getArtistById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const artists = await db.query(`
            SELECT u.id, u.email, u.full_name, u.phone, u.profile_pic, u.cover_photo, u.is_verified, u.created_at,
                   ap.stage_name, ap.genre, ap.bio, ap.experience_years, ap.price_range, 
                   ap.performance_duration, ap.equipment_provided, ap.spotify_link, 
                   ap.youtube_link, ap.instagram_link, ap.rating, ap.total_shows
            FROM users u
            INNER JOIN artist_profiles ap ON u.id = ap.user_id
            WHERE u.id = $1 AND u.user_type = 'artist'
        `, [id]);
        
        if (artists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Artist not found'
            });
        }
        
        res.json({
            success: true,
            data: artists.rows[0]
        });
    } catch (error) {
        console.error('Get artist by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching artist'
        });
    }
};

/**
 * Update artist profile
 * PUT /api/artists/profile
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            fullName, phone, city, stageName, genre, bio, experienceYears,
            priceRange, performanceDuration, equipmentProvided,
            spotifyLink, youtubeLink, instagramLink
        } = req.body;
        
        // Update users table (only if values provided)
        const userUpdates = [];
        const userValues = [];
        
        if (fullName !== undefined) {
            userUpdates.push(`full_name = $${userValues.length + 1}`);
            userValues.push(fullName);
        }
        if (phone !== undefined) {
            userUpdates.push(`phone = $${userValues.length + 1}`);
            userValues.push(phone);
        }
        
        if (userUpdates.length > 0) {
            userValues.push(userId);
            await db.query(
                `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${userValues.length}`,
                userValues
            );
        }
        
        // Update artist_profiles table (only if values provided)
        const profileUpdates = [];
        const profileValues = [];
        
        if (stageName !== undefined) {
            profileUpdates.push(`stage_name = $${profileValues.length + 1}`);
            profileValues.push(stageName);
        }
        if (genre !== undefined) {
            profileUpdates.push(`genre = $${profileValues.length + 1}`);
            profileValues.push(genre);
        }
        if (bio !== undefined) {
            profileUpdates.push(`bio = $${profileValues.length + 1}`);
            profileValues.push(bio);
        }
        if (experienceYears !== undefined) {
            profileUpdates.push(`experience_years = $${profileValues.length + 1}`);
            profileValues.push(experienceYears);
        }
        if (priceRange !== undefined) {
            profileUpdates.push(`price_range = $${profileValues.length + 1}`);
            profileValues.push(priceRange);
        }
        if (performanceDuration !== undefined) {
            profileUpdates.push(`performance_duration = $${profileValues.length + 1}`);
            profileValues.push(performanceDuration);
        }
        if (equipmentProvided !== undefined) {
            profileUpdates.push(`equipment_provided = $${profileValues.length + 1}`);
            profileValues.push(equipmentProvided);
        }
        if (spotifyLink !== undefined) {
            profileUpdates.push(`spotify_link = $${profileValues.length + 1}`);
            profileValues.push(spotifyLink);
        }
        if (youtubeLink !== undefined) {
            profileUpdates.push(`youtube_link = $${profileValues.length + 1}`);
            profileValues.push(youtubeLink);
        }
        if (instagramLink !== undefined) {
            profileUpdates.push(`instagram_link = $${profileValues.length + 1}`);
            profileValues.push(instagramLink);
        }
        if (city !== undefined) {
            profileUpdates.push(`city = $${profileValues.length + 1}`);
            profileValues.push(city);
        }
        
        if (profileUpdates.length > 0) {
            profileValues.push(userId);
            await db.query(
                `UPDATE artist_profiles SET ${profileUpdates.join(', ')} WHERE user_id = $${profileValues.length}`,
                profileValues
            );
        }
        
        console.log('✅ Artist profile updated:', userId);
        
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update artist profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

/**
 * Get artist portfolio (media posts)
 * GET /api/artists/:id/portfolio
 */
const getPortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        
        const media = await db.query(`
            SELECT id, media_type, file_url, thumbnail_url, title, description, 
                   likes_count, views_count, created_at
            FROM media_posts
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [id]);
        
        res.json({
            success: true,
            count: media.rows.length,
            data: media.rows
        });
    } catch (error) {
        console.error('Get portfolio error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio'
        });
    }
};

/**
 * Get artist reviews
 * GET /api/artists/:id/reviews
 */
const getReviews = async (req, res) => {
    try {
        const { id } = req.params;
        
        const reviews = await db.query(`
            SELECT r.id, r.rating, r.review_text, r.created_at,
                   u.full_name as reviewer_name, u.profile_pic as reviewer_pic
            FROM reviews r
            INNER JOIN users u ON r.reviewer_id = u.id
            WHERE r.reviewed_id = $1
            ORDER BY r.created_at DESC
        `, [id]);
        
        res.json({
            success: true,
            count: reviews.rows.length,
            data: reviews.rows
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
    getAllArtists,
    getArtistById,
    updateProfile,
    getPortfolio,
    getReviews
};
