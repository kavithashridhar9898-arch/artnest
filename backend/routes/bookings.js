/**
 * Booking Routes
 */

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

router.post('/request', verifyToken, bookingController.createBookingRequest);
router.get('/sent', verifyToken, bookingController.getSentRequests);
router.get('/received', verifyToken, bookingController.getReceivedRequests);
router.put('/:id/accept', verifyToken, bookingController.acceptBooking);
router.put('/:id/reject', verifyToken, bookingController.rejectBooking);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);
router.put('/:id/complete', verifyToken, bookingController.completeBooking);
router.post('/:id/review', verifyToken, bookingController.addReview);

module.exports = router;
