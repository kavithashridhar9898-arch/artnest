/**
 * Bookings Module - Handles booking request management
 * Manages creation, retrieval, and status updates of booking requests
 */

const BookingManager = (function() {
    'use strict';

    // Get API base URL from ArtNest utility
    const API_BASE = window.ArtNest?.API_BASE_URL || 'http://localhost:3000/api';

    /**
     * Create a new booking request
     * @param {Object} bookingData - Booking details
     * @returns {Promise<Object>} API response
     */
    async function createBooking(bookingData) {
        try {
            console.log('Creating booking request:', bookingData);

            const response = await window.ArtNest.apiRequest('/bookings/request', {
                method: 'POST',
                body: JSON.stringify(bookingData)
            });

            if (response.success) {
                console.log('Booking created successfully:', response.data);
                window.ArtNest.showToast('Booking request sent successfully!', 'success');
                return response;
            } else {
                throw new Error(response.message || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            window.ArtNest.showToast(error.message || 'Failed to create booking', 'error');
            throw error;
        }
    }

    /**
     * Get all sent booking requests
     * @returns {Promise<Array>} List of sent bookings
     */
    async function getSentBookings() {
        try {
            const response = await window.ArtNest.apiRequest('/bookings/sent', {
                method: 'GET'
            });

            if (response.success) {
                console.log(`Retrieved ${response.data.length} sent bookings`);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch sent bookings');
            }
        } catch (error) {
            console.error('Error fetching sent bookings:', error);
            window.ArtNest.showToast('Failed to load sent bookings', 'error');
            return [];
        }
    }

    /**
     * Get all received booking requests
     * @returns {Promise<Array>} List of received bookings
     */
    async function getReceivedBookings() {
        try {
            const response = await window.ArtNest.apiRequest('/bookings/received', {
                method: 'GET'
            });

            if (response.success) {
                console.log(`Retrieved ${response.data.length} received bookings`);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch received bookings');
            }
        } catch (error) {
            console.error('Error fetching received bookings:', error);
            window.ArtNest.showToast('Failed to load received bookings', 'error');
            return [];
        }
    }

    /**
     * Accept a booking request
     * @param {number} bookingId - ID of the booking to accept
     * @returns {Promise<Object>} API response
     */
    async function acceptBooking(bookingId) {
        try {
            console.log('Accepting booking:', bookingId);

            const response = await window.ArtNest.apiRequest(`/bookings/${bookingId}/accept`, {
                method: 'PUT'
            });

            if (response.success) {
                console.log('Booking accepted successfully');
                window.ArtNest.showToast('Booking accepted!', 'success');
                return response;
            } else {
                throw new Error(response.message || 'Failed to accept booking');
            }
        } catch (error) {
            console.error('Error accepting booking:', error);
            window.ArtNest.showToast(error.message || 'Failed to accept booking', 'error');
            throw error;
        }
    }

    /**
     * Reject a booking request
     * @param {number} bookingId - ID of the booking to reject
     * @returns {Promise<Object>} API response
     */
    async function rejectBooking(bookingId) {
        try {
            console.log('Rejecting booking:', bookingId);

            const response = await window.ArtNest.apiRequest(`/bookings/${bookingId}/reject`, {
                method: 'PUT'
            });

            if (response.success) {
                console.log('Booking rejected successfully');
                window.ArtNest.showToast('Booking rejected', 'info');
                return response;
            } else {
                throw new Error(response.message || 'Failed to reject booking');
            }
        } catch (error) {
            console.error('Error rejecting booking:', error);
            window.ArtNest.showToast(error.message || 'Failed to reject booking', 'error');
            throw error;
        }
    }

    /**
     * Cancel a booking request
     * @param {number} bookingId - ID of the booking to cancel
     * @returns {Promise<Object>} API response
     */
    async function cancelBooking(bookingId) {
        try {
            console.log('Canceling booking:', bookingId);

            const response = await window.ArtNest.apiRequest(`/bookings/${bookingId}/cancel`, {
                method: 'PUT'
            });

            if (response.success) {
                console.log('Booking canceled successfully');
                window.ArtNest.showToast('Booking canceled', 'info');
                return response;
            } else {
                throw new Error(response.message || 'Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            window.ArtNest.showToast(error.message || 'Failed to cancel booking', 'error');
            throw error;
        }
    }

    /**
     * Mark a booking as completed
     * @param {number} bookingId - ID of the booking to complete
     * @returns {Promise<Object>} API response
     */
    async function completeBooking(bookingId) {
        try {
            console.log('Completing booking:', bookingId);

            const response = await window.ArtNest.apiRequest(`/bookings/${bookingId}/complete`, {
                method: 'PUT'
            });

            if (response.success) {
                console.log('Booking completed successfully');
                window.ArtNest.showToast('Booking marked as completed!', 'success');
                return response;
            } else {
                throw new Error(response.message || 'Failed to complete booking');
            }
        } catch (error) {
            console.error('Error completing booking:', error);
            window.ArtNest.showToast(error.message || 'Failed to complete booking', 'error');
            throw error;
        }
    }

    /**
     * Add a review for a completed booking
     * @param {number} bookingId - ID of the booking to review
     * @param {Object} reviewData - Review details (rating, comment)
     * @returns {Promise<Object>} API response
     */
    async function addReview(bookingId, reviewData) {
        try {
            console.log('Adding review for booking:', bookingId, reviewData);

            const response = await window.ArtNest.apiRequest(`/bookings/${bookingId}/review`, {
                method: 'POST',
                body: JSON.stringify(reviewData)
            });

            if (response.success) {
                console.log('Review added successfully');
                window.ArtNest.showToast('Review submitted successfully!', 'success');
                return response;
            } else {
                throw new Error(response.message || 'Failed to add review');
            }
        } catch (error) {
            console.error('Error adding review:', error);
            window.ArtNest.showToast(error.message || 'Failed to submit review', 'error');
            throw error;
        }
    }

    /**
     * Render booking card HTML
     * @param {Object} booking - Booking object
     * @param {string} type - 'sent' or 'received'
     * @returns {string} HTML string
     */
    function renderBookingCard(booking, type = 'received') {
        const statusColors = {
            pending: 'pending',
            accepted: 'success',
            rejected: 'error',
            cancelled: 'error',
            completed: 'success'
        };

        const statusClass = statusColors[booking.status] || 'pending';
        const otherUserName = type === 'sent' ? booking.receiver_name : booking.sender_name;

        return `
            <div class="booking-card" data-booking-id="${booking.id}">
                <div class="booking-header">
                    <div class="user-info">
                        <h4>${otherUserName || 'Unknown User'}</h4>
                        <p>${booking.venue_name || booking.genre || 'Booking'}</p>
                    </div>
                    <span class="booking-status ${statusClass}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <span>📅 ${window.ArtNest.formatDate(booking.event_date)}</span>
                    ${booking.budget ? `<span>💰 $${booking.budget.toLocaleString()}</span>` : ''}
                </div>
                ${booking.message ? `<p class="booking-message">${booking.message}</p>` : ''}
                ${renderBookingActions(booking, type)}
            </div>
        `;
    }

    /**
     * Render booking action buttons based on status and type
     * @param {Object} booking - Booking object
     * @param {string} type - 'sent' or 'received'
     * @returns {string} HTML string
     */
    function renderBookingActions(booking, type) {
        if (booking.status === 'pending' && type === 'received') {
            return `
                <div class="booking-actions">
                    <button class="btn-accept" onclick="BookingManager.accept(${booking.id})">
                        Accept
                    </button>
                    <button class="btn-reject" onclick="BookingManager.reject(${booking.id})">
                        Decline
                    </button>
                </div>
            `;
        } else if (booking.status === 'pending' && type === 'sent') {
            return `
                <div class="booking-actions">
                    <button class="btn-reject" onclick="BookingManager.cancel(${booking.id})">
                        Cancel Request
                    </button>
                </div>
            `;
        } else if (booking.status === 'accepted') {
            return `
                <div class="booking-actions">
                    <button class="btn btn-primary" onclick="BookingManager.complete(${booking.id})">
                        Mark as Completed
                    </button>
                </div>
            `;
        } else if (booking.status === 'completed' && !booking.has_review) {
            return `
                <div class="booking-actions">
                    <button class="btn btn-primary" onclick="BookingManager.openReviewModal(${booking.id})">
                        Leave a Review
                    </button>
                </div>
            `;
        }
        return '';
    }

    /**
     * Filter bookings by status
     * @param {Array} bookings - Array of booking objects
     * @param {string} status - Status to filter by
     * @returns {Array} Filtered bookings
     */
    function filterByStatus(bookings, status) {
        if (!status || status === 'all') {
            return bookings;
        }
        return bookings.filter(booking => booking.status === status);
    }

    /**
     * Sort bookings by date
     * @param {Array} bookings - Array of booking objects
     * @param {string} order - 'asc' or 'desc'
     * @returns {Array} Sorted bookings
     */
    function sortByDate(bookings, order = 'desc') {
        return [...bookings].sort((a, b) => {
            const dateA = new Date(a.event_date);
            const dateB = new Date(b.event_date);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    // Public API
    return {
        create: createBooking,
        getSent: getSentBookings,
        getReceived: getReceivedBookings,
        accept: acceptBooking,
        reject: rejectBooking,
        cancel: cancelBooking,
        complete: completeBooking,
        addReview: addReview,
        renderCard: renderBookingCard,
        filterByStatus: filterByStatus,
        sortByDate: sortByDate
    };
})();

// Expose to global scope
window.BookingManager = BookingManager;

console.log('✅ Booking Manager loaded');
