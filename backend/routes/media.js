/**
 * Media Routes
 */

const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { verifyToken } = require('../middleware/auth');
const { uploadMedia: uploadMiddleware, handleUploadError } = require('../middleware/upload');

router.post('/upload', verifyToken, uploadMiddleware.single('file'), handleUploadError, mediaController.uploadMedia);
router.get('/feed', mediaController.getFeed);
router.get('/user/:userId', mediaController.getUserMedia);
router.get('/:id', mediaController.getMediaById);
router.delete('/:id', verifyToken, mediaController.deleteMedia);
router.post('/:id/like', verifyToken, mediaController.toggleLike);
router.post('/:id/comments', verifyToken, mediaController.addComment);
router.get('/:id/comments', mediaController.getComments);

module.exports = router;
