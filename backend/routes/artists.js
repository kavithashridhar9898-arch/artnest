/**
 * Artist Routes
 */

const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');
const { verifyToken, isArtist } = require('../middleware/auth');

router.get('/', artistController.getAllArtists);
router.get('/:id', artistController.getArtistById);
router.put('/profile', verifyToken, isArtist, artistController.updateProfile);
router.get('/:id/portfolio', artistController.getPortfolio);
router.get('/:id/reviews', artistController.getReviews);

module.exports = router;
