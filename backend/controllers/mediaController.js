/**
 * Media Controller
 * Handles media uploads, likes, comments
 */

const db = require('../config/db');
const path = require('path');

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.userId;
        const { title, description, tags } = req.body;
        
        // Get the correct subdirectory from the file path
        const relativePath = req.file.path.replace(/\\/g, '/').split('backend/uploads/')[1];
        const fileUrl = `/uploads/${relativePath}`;
        const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

        const result = await db.query(`
            INSERT INTO media_posts (user_id, media_type, file_url, title, description, tags)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [userId, mediaType, fileUrl, title, description, tags]);

        console.log('✅ Media uploaded:', result.rows[0].id);

        res.status(201).json({
            success: true,
            message: 'Media uploaded successfully',
            data: {
                id: result.rows[0].id,
                fileUrl: fileUrl,
                mediaType: mediaType
            }
        });
    } catch (error) {
        console.error('Upload media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading media'
        });
    }
};

const getFeed = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const media = await db.query(`
            SELECT mp.*, u.full_name, u.profile_pic, u.user_type
            FROM media_posts mp
            INNER JOIN users u ON mp.user_id = u.id
            ORDER BY mp.created_at DESC
            LIMIT $1 OFFSET $2
        `, [parseInt(limit), parseInt(offset)]);

        res.json({
            success: true,
            count: media.rows.length,
            data: media.rows
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching media feed'
        });
    }
};

const getUserMedia = async (req, res) => {
    try {
        const { userId } = req.params;

        const media = await db.query(`
            SELECT * FROM media_posts
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);

        res.json({
            success: true,
            count: media.rows.length,
            data: media.rows
        });
    } catch (error) {
        console.error('Get user media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user media'
        });
    }
};

const getMediaById = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await db.query(`
            SELECT mp.*, u.full_name, u.profile_pic, u.user_type
            FROM media_posts mp
            INNER JOIN users u ON mp.user_id = u.id
            WHERE mp.id = $1
        `, [id]);

        if (media.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Media not found'
            });
        }

        // Increment views
        await db.query('UPDATE media_posts SET views_count = views_count + 1 WHERE id = $1', [id]);

        res.json({
            success: true,
            data: media.rows[0]
        });
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching media'
        });
    }
};

const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await db.query('DELETE FROM media_posts WHERE id = $1 AND user_id = $2', [id, userId]);

        res.json({
            success: true,
            message: 'Media deleted successfully'
        });
    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting media'
        });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if already liked
        const existing = await db.query(
            'SELECT id FROM media_likes WHERE media_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existing.rows.length > 0) {
            // Unlike
            await db.query('DELETE FROM media_likes WHERE media_id = $1 AND user_id = $2', [id, userId]);
            await db.query('UPDATE media_posts SET likes_count = likes_count - 1 WHERE id = $1', [id]);
            
            // Get updated count
            const media = await db.query('SELECT likes_count FROM media_posts WHERE id = $1', [id]);
            
            res.json({
                success: true,
                message: 'Media unliked',
                data: {
                    liked: false,
                    likes_count: media.rows[0].likes_count
                }
            });
        } else {
            // Like
            await db.query('INSERT INTO media_likes (media_id, user_id) VALUES ($1, $2)', [id, userId]);
            await db.query('UPDATE media_posts SET likes_count = likes_count + 1 WHERE id = $1', [id]);
            
            // Get updated count
            const media = await db.query('SELECT likes_count FROM media_posts WHERE id = $1', [id]);
            
            res.json({
                success: true,
                message: 'Media liked',
                data: {
                    liked: true,
                    likes_count: media.rows[0].likes_count
                }
            });
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling like'
        });
    }
};

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { comment, comment_text } = req.body;
        const commentText = comment || comment_text;

        if (!commentText || commentText.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const result = await db.query(`
            INSERT INTO media_comments (media_id, user_id, comment)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [id, userId, commentText]);

        // Update comment count
        await db.query('UPDATE media_posts SET comments_count = comments_count + 1 WHERE id = $1', [id]);

        res.status(201).json({
            success: true,
            message: 'Comment added',
            data: { commentId: result.rows[0].id }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
        });
    }
};

const getComments = async (req, res) => {
    try {
        const { id } = req.params;

        const comments = await db.query(`
            SELECT mc.*, u.full_name, u.profile_pic
            FROM media_comments mc
            INNER JOIN users u ON mc.user_id = u.id
            WHERE mc.media_id = $1
            ORDER BY mc.created_at DESC
        `, [id]);

        res.json({
            success: true,
            count: comments.rows.length,
            data: comments.rows
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    }
};

module.exports = {
    uploadMedia,
    getFeed,
    getUserMedia,
    getMediaById,
    deleteMedia,
    toggleLike,
    addComment,
    getComments
};
