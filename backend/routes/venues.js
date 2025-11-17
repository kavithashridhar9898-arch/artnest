/**
 * Venue Routes
 */

const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { verifyToken, isVenue } = require('../middleware/auth');

router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);
router.put('/profile', verifyToken, isVenue, venueController.updateProfile);
router.get('/:id/gallery', venueController.getGallery);
router.get('/:id/reviews', venueController.getReviews);

module.exports = router;
