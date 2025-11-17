/**
 * Media Module - Handles media upload, display, and interactions
 * Manages media feed, likes, comments, and lightbox functionality
 */

const MediaManager = (function() {
    'use strict';

    // State
    let currentFilter = 'all';
    let currentMediaId = null;
    let allMedia = [];

    /**
     * Initialize media manager
     */
    function init() {
        console.log('Initializing Media Manager...');
        setupEventListeners();
        loadMediaFeed();
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', handleFilterChange);
        });

        // File upload
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileUpload);
        }

        // Drag and drop on upload section
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection) {
            // Remove click listener that was causing issues
            uploadSection.addEventListener('dragover', handleDragOver);
            uploadSection.addEventListener('drop', handleDrop);
            uploadSection.addEventListener('dragleave', (e) => {
                e.preventDefault();
            });
        }

        // Lightbox
        const lightbox = document.getElementById('lightbox');
        const lightboxClose = document.getElementById('lightboxClose');
        if (lightbox && lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        // Comments
        const closeComments = document.getElementById('closeComments');
        const postCommentBtn = document.getElementById('postCommentBtn');
        if (closeComments) {
            closeComments.addEventListener('click', closeCommentPanel);
        }
        if (postCommentBtn) {
            postCommentBtn.addEventListener('click', postComment);
        }

        // Comment input enter key
        const commentInput = document.getElementById('commentInput');
        if (commentInput) {
            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    postComment();
                }
            });
        }
    }

    /**
     * Handle filter change
     */
    function handleFilterChange(e) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // Apply filter
        currentFilter = e.target.dataset.filter;
        displayMedia(filterMedia(allMedia, currentFilter));
    }

    /**
     * Filter media based on type
     */
    function filterMedia(media, filter) {
        const user = JSON.parse(localStorage.getItem('artnet_user'));
        
        switch (filter) {
            case 'image':
                return media.filter(m => m.media_type === 'image');
            case 'video':
                return media.filter(m => m.media_type === 'video');
            case 'my':
                return media.filter(m => m.user_id === user.userId);
            default:
                return media;
        }
    }

    /**
     * Load media feed
     */
    async function loadMediaFeed() {
        try {
            console.log('Loading media feed...');
            const loadingState = document.getElementById('loadingState');
            const mediaGrid = document.getElementById('mediaGrid');

            loadingState.style.display = 'block';
            mediaGrid.style.display = 'none';

            const response = await window.ArtNest.apiRequest('/media/feed', {
                method: 'GET'
            });

            if (response.success) {
                allMedia = response.data;
                console.log(`Loaded ${allMedia.length} media items`);
                displayMedia(filterMedia(allMedia, currentFilter));
            } else {
                throw new Error(response.message || 'Failed to load media');
            }

            loadingState.style.display = 'none';
            mediaGrid.style.display = 'block';
        } catch (error) {
            console.error('Error loading media feed:', error);
            window.ArtNest.showToast('Failed to load media feed', 'error');
            document.getElementById('loadingState').innerHTML = `
                <p style="color: var(--error-red);">Failed to load media</p>
            `;
        }
    }

    /**
     * Display media in grid
     */
    function displayMedia(media) {
        const grid = document.getElementById('mediaGrid');
        
        if (media.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <p>No media found</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = media.map((item, index) => `
            <div class="media-item" style="animation-delay: ${index * 0.05}s;">
                <div class="media-content" onclick="MediaManager.openLightbox(${item.id})">
                    ${item.media_type === 'video' ? `
                        <video src="http://localhost:3000${item.file_url}"></video>
                        <div class="play-overlay">▶️</div>
                    ` : `
                        <img src="http://localhost:3000${item.file_url}" alt="${item.title || 'Media'}">
                    `}
                </div>
                <div class="media-info">
                    <div class="media-header">
                        <div class="user-avatar">${item.full_name?.charAt(0) || 'U'}</div>
                        <div class="user-info">
                            <h4>${item.full_name || 'User'}</h4>
                            <div class="media-time">${window.ArtNest.formatDate(item.created_at)}</div>
                        </div>
                    </div>
                    ${item.title ? `<div class="media-caption"><strong>${item.title}</strong></div>` : ''}
                    ${item.description ? `<div class="media-caption">${item.description}</div>` : ''}
                    <div class="media-actions">
                        <button class="action-btn ${item.user_has_liked ? 'liked' : ''}" onclick="MediaManager.toggleLike(${item.id})">
                            <span class="heart-icon">${item.user_has_liked ? '❤️' : '🤍'}</span>
                            <span>${item.likes_count || 0}</span>
                        </button>
                        <button class="action-btn" onclick="MediaManager.openComments(${item.id})">
                            <span>💬</span>
                            <span>${item.comments_count || 0}</span>
                        </button>
                        <button class="action-btn" onclick="MediaManager.shareMedia(${item.id})">
                            <span>📤</span>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Handle file upload
     */
    async function handleFileUpload(e) {
        const files = e.target.files;
        if (files.length === 0) return;

        for (let file of files) {
            await uploadFile(file);
        }

        // Reload feed
        await loadMediaFeed();
        
        // Hide upload section
        document.getElementById('uploadSection').style.display = 'none';
    }

    /**
     * Upload file to server
     */
    async function uploadFile(file) {
        try {
            console.log('Uploading file:', file.name);

            const formData = new FormData();
            formData.append('file', file);
            
            // Prompt for caption
            const title = prompt('Enter a title (optional):');
            if (title) {
                formData.append('title', title);
            }
            
            const description = prompt('Enter a description (optional):');
            if (description) {
                formData.append('description', description);
            }

            const token = localStorage.getItem('artnet_token');
            const response = await fetch('http://localhost:3000/api/media/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                console.log('File uploaded successfully');
                window.ArtNest.showToast('Media uploaded successfully!', 'success');
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            window.ArtNest.showToast(error.message || 'Failed to upload media', 'error');
        }
    }

    /**
     * Handle drag over
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = 'var(--primary-purple)';
    }

    /**
     * Handle drop
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.style.borderColor = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('fileInput').files = files;
            handleFileUpload({ target: { files } });
        }
    }

    /**
     * Toggle like on media
     */
    async function toggleLike(mediaId) {
        try {
            console.log('Toggling like for media:', mediaId);

            const response = await window.ArtNest.apiRequest(`/media/${mediaId}/like`, {
                method: 'POST'
            });

            if (response.success) {
                // Update UI
                const mediaItem = allMedia.find(m => m.id === mediaId);
                if (mediaItem) {
                    mediaItem.user_has_liked = !mediaItem.user_has_liked;
                    mediaItem.likes_count = response.data.likes_count;
                }
                displayMedia(filterMedia(allMedia, currentFilter));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            window.ArtNest.showToast('Failed to update like', 'error');
        }
    }

    /**
     * Open lightbox
     */
    function openLightbox(mediaId) {
        const media = allMedia.find(m => m.id === mediaId);
        if (!media) return;

        const lightbox = document.getElementById('lightbox');
        const content = document.getElementById('lightboxContent');

        if (media.media_type === 'video') {
            content.innerHTML = `
                <video src="http://localhost:3000${media.file_url}" controls autoplay style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
            `;
        } else {
            content.innerHTML = `
                <img src="http://localhost:3000${media.file_url}" alt="${media.title || 'Media'}" style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
            `;
        }

        lightbox.classList.add('active');
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        const content = document.getElementById('lightboxContent');
        
        lightbox.classList.remove('active');
        content.innerHTML = '';
    }

    /**
     * Open comments panel
     */
    async function openComments(mediaId) {
        currentMediaId = mediaId;
        const panel = document.getElementById('commentPanel');
        panel.classList.add('active');

        await loadComments(mediaId);
    }

    /**
     * Close comment panel
     */
    function closeCommentPanel() {
        document.getElementById('commentPanel').classList.remove('active');
        currentMediaId = null;
    }

    /**
     * Load comments for media
     */
    async function loadComments(mediaId) {
        try {
            console.log('Loading comments for media:', mediaId);

            const response = await window.ArtNest.apiRequest(`/media/${mediaId}/comments`, {
                method: 'GET'
            });

            if (response.success) {
                displayComments(response.data);
            } else {
                throw new Error(response.message || 'Failed to load comments');
            }
        } catch (error) {
            console.error('Error loading comments:', error);
            document.getElementById('commentList').innerHTML = `
                <p style="text-align: center; color: var(--text-secondary);">Failed to load comments</p>
            `;
        }
    }

    /**
     * Display comments
     */
    function displayComments(comments) {
        const list = document.getElementById('commentList');

        if (comments.length === 0) {
            list.innerHTML = `
                <p style="text-align: center; color: var(--text-secondary);">No comments yet</p>
            `;
            return;
        }

        list.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-author">${comment.full_name || 'Anonymous'}</div>
                <div class="comment-text">${comment.comment || comment.comment_text || 'No comment'}</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    ${window.ArtNest.formatDate(comment.created_at)}
                </div>
            </div>
        `).join('');
    }

    /**
     * Post a comment
     */
    async function postComment() {
        if (!currentMediaId) return;

        const input = document.getElementById('commentInput');
        const commentText = input.value.trim();

        if (!commentText) {
            window.ArtNest.showToast('Please enter a comment', 'error');
            return;
        }

        try {
            console.log('Posting comment:', commentText);

            const response = await window.ArtNest.apiRequest(`/media/${currentMediaId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ comment_text: commentText })
            });

            if (response.success) {
                input.value = '';
                await loadComments(currentMediaId);
                window.ArtNest.showToast('Comment posted!', 'success');
                
                // Update comment count in UI
                const media = allMedia.find(m => m.id === currentMediaId);
                if (media) {
                    media.comments_count = (media.comments_count || 0) + 1;
                    displayMedia(filterMedia(allMedia, currentFilter));
                }
            } else {
                throw new Error(response.message || 'Failed to post comment');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            window.ArtNest.showToast(error.message || 'Failed to post comment', 'error');
        }
    }

    /**
     * Share media (placeholder)
     */
    function shareMedia(mediaId) {
        const media = allMedia.find(m => m.id === mediaId);
        if (!media) return;

        const url = `${window.location.origin}/media.html?id=${mediaId}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Check out this media on ArtNest',
                text: media.caption || 'Shared from ArtNest',
                url: url
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(url).then(() => {
                window.ArtNest.showToast('Link copied to clipboard!', 'success');
            });
        }
    }

    // Public API
    return {
        init: init,
        toggleLike: toggleLike,
        openLightbox: openLightbox,
        openComments: openComments,
        shareMedia: shareMedia
    };
})();

// Expose to global scope
window.MediaManager = MediaManager;

console.log('✅ Media Manager loaded');
