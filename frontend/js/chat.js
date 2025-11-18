/**
 * Chat Module - Handles real-time messaging with Socket.IO
 * Manages conversations, messages, typing indicators, and online status
 */

const ChatManager = (function() {
    'use strict';

    // State
    let socket = null;
    let currentConversationId = null;
    let currentReceiverId = null;
    let conversations = [];
    let typingTimeout = null;

    /**
     * Initialize chat manager
     */
    function init() {
        console.log('Initializing Chat Manager...');
        
        const token = localStorage.getItem('artnet_token');
        if (!token) {
            console.error('No auth token found');
            return;
        }

        // Initialize Socket.IO
        initializeSocket(token);
        
        // Setup event listeners
        setupEventListeners();
        
        // Load conversations
        loadConversations();
    }

    /**
     * Initialize Socket.IO connection
     */
    function initializeSocket(token) {
        console.log('Connecting to Socket.IO server...');

        socket = io(window.API_BASE_URL, {
            auth: {
                token: token
            }
        });

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Connected to Socket.IO server');
            window.ArtNest.showToast('Connected to chat server', 'success');
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket.IO server');
            window.ArtNest.showToast('Disconnected from chat server', 'error');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            window.ArtNest.showToast('Failed to connect to chat server', 'error');
        });

        // Chat events
        socket.on('receive_message', handleReceiveMessage);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);
        socket.on('message_read', handleMessageRead);
        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Send message
        const sendBtn = document.getElementById('sendBtn');
        const messageInput = document.getElementById('messageInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Typing indicator
            messageInput.addEventListener('input', handleTypingInput);
        }

        // File attachment
        const attachBtn = document.getElementById('attachBtn');
        const fileAttachment = document.getElementById('fileAttachment');
        
        if (attachBtn && fileAttachment) {
            attachBtn.addEventListener('click', () => fileAttachment.click());
            fileAttachment.addEventListener('change', handleFileAttachment);
        }

        // New chat
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', openNewChatModal);
        }

        // Mobile back button
        const mobileBackBtn = document.getElementById('mobileBackBtn');
        if (mobileBackBtn) {
            mobileBackBtn.addEventListener('click', () => {
                document.querySelector('.chat-window').classList.remove('active');
                document.querySelector('.conversations-panel').style.display = 'flex';
                document.getElementById('mobileBackBtn').style.display = 'none';
                document.getElementById('emptyState').style.display = 'flex';
                document.getElementById('activeChat').style.display = 'none';
            });
        }

        // Call buttons
        const callBtn = document.getElementById('callBtn');
        if (callBtn) {
            callBtn.addEventListener('click', () => {
                window.ArtNest.showToast('Audio call feature coming soon! 📞', 'info');
            });
        }

        const videoCallBtn = document.getElementById('videoCallBtn');
        if (videoCallBtn) {
            videoCallBtn.addEventListener('click', () => {
                window.ArtNest.showToast('Video call feature coming soon! 📹', 'info');
            });
        }

        const moreBtn = document.getElementById('moreBtn');
        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                window.ArtNest.showToast('More options coming soon!', 'info');
            });
        }

        // Search conversations
        const searchInput = document.getElementById('searchConversations');
        if (searchInput) {
            searchInput.addEventListener('input', window.ArtNest.debounce((e) => {
                filterConversations(e.target.value);
            }, 300));
        }

        // Emoji button
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🎵', '🎸', '🎶', '✨', '🔥'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                const input = document.getElementById('messageInput');
                input.value += randomEmoji;
                input.focus();
            });
        }
    }

    /**
     * Load conversations
     */
    async function loadConversations() {
        try {
            console.log('Loading conversations...');

            const response = await window.ArtNest.apiRequest('/chat/conversations', {
                method: 'GET'
            });

            if (response.success) {
                conversations = response.data;
                console.log(`Loaded ${conversations.length} conversations`);
                displayConversations(conversations);
            } else {
                throw new Error(response.message || 'Failed to load conversations');
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            const list = document.getElementById('conversationsList');
            list.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>Failed to load conversations</p>
                </div>
            `;
        }
    }

    /**
     * Display conversations
     */
    function displayConversations(convos) {
        const list = document.getElementById('conversationsList');
        
        if (convos.length === 0) {
            list.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;">💬</p>
                    <p>No conversations yet</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">Accept a booking to start chatting</p>
                </div>
            `;
            return;
        }

        list.innerHTML = convos.map(convo => `
            <div class="conversation-item ${ convo.unread_count > 0 ? 'unread' : ''}" 
                 data-conversation-id="${convo.id}" 
                 onclick="ChatManager.openConversation(${convo.id}, ${convo.other_user_id})">
                <div class="conversation-avatar-wrapper">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-purple), var(--primary-blue)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.25rem;">
                        ${convo.other_user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    ${convo.is_online ? '<span class="online-indicator"></span>' : ''}
                </div>
                <div class="conversation-info">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <div class="conversation-name">${convo.other_user_name || 'Unknown User'}</div>
                        <span class="conversation-time">${window.ArtNest.formatTime(convo.last_message_time || convo.created_at)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="conversation-last-message">${convo.last_message || 'Start conversation...'}</div>
                        ${convo.unread_count > 0 ? `<span class="unread-badge">${convo.unread_count}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Filter conversations by search query
     */
    function filterConversations(query) {
        if (!query) {
            displayConversations(conversations);
            return;
        }

        const filtered = conversations.filter(convo => 
            convo.other_user_name?.toLowerCase().includes(query.toLowerCase())
        );
        displayConversations(filtered);
    }

    /**
     * Open conversation
     */
    async function openConversation(conversationId, receiverId) {
        console.log('Opening conversation:', conversationId);

        currentConversationId = conversationId;
        currentReceiverId = receiverId;

        // Join conversation room
        if (socket) {
            socket.emit('join_conversation', conversationId);
        }

        // Show chat window
        document.getElementById('emptyState').style.display = 'none';
        const activeChat = document.getElementById('activeChat');
        activeChat.style.display = 'flex';

        // Mobile: hide conversations panel
        if (window.innerWidth <= 768) {
            document.querySelector('.conversations-panel').style.display = 'none';
            document.querySelector('.chat-window').classList.add('active');
            document.getElementById('mobileBackBtn').style.display = 'block';
        }

        // Update header
        const convo = conversations.find(c => c.id === conversationId);
        if (convo) {
            const avatarInitial = convo.other_user_name?.charAt(0).toUpperCase() || 'U';
            document.getElementById('chatAvatar').textContent = avatarInitial;
            document.getElementById('typingAvatar').textContent = avatarInitial;
            document.getElementById('chatUserName').textContent = convo.other_user_name || 'Unknown User';
            updateOnlineStatus(convo.is_online);
        }

        // Highlight active conversation
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.conversationId) === conversationId) {
                item.classList.add('active');
            }
        });

        // Load messages
        await loadMessages(conversationId);

        // Mark as read
        await markAsRead(conversationId);

        // Focus input
        document.getElementById('messageInput').focus();
    }

    /**
     * Load messages for conversation
     */
    async function loadMessages(conversationId) {
        try {
            console.log('Loading messages for conversation:', conversationId);

            const response = await window.ArtNest.apiRequest(`/chat/conversations/${conversationId}/messages`, {
                method: 'GET'
            });

            if (response.success) {
                displayMessages(response.data);
            } else {
                throw new Error(response.message || 'Failed to load messages');
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            const container = document.getElementById('messagesContainer');
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <p>Failed to load messages</p>
                </div>
            `;
        }
    }

    /**
     * Display messages
     */
    function displayMessages(messages) {
        const container = document.getElementById('messagesContainer');
        const user = JSON.parse(localStorage.getItem('artnet_user'));

        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <p style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;">👋</p>
                    <p>No messages yet</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.7;">Say hello to start the conversation!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(msg => {
            const isSent = msg.sender_id === user.userId;
            const avatarInitial = isSent ? user.fullName?.charAt(0).toUpperCase() || 'Y' : conversations.find(c => c.id === currentConversationId)?.other_user_name?.charAt(0).toUpperCase() || 'U';
            
            return `
                <div class="message ${isSent ? 'sent' : 'received'}" style="animation: fadeInUp 0.3s ease-out;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-purple), var(--primary-blue)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1rem; flex-shrink: 0;">
                        ${avatarInitial}
                    </div>
                    <div class="message-content">
                        <div class="message-bubble">
                            <div class="message-text">${escapeHtml(msg.message_text)}</div>
                            <div class="message-footer">
                                <span class="message-time">${window.ArtNest.formatTime(msg.created_at)}</span>
                                ${isSent ? `<span class="message-status ${msg.is_read ? 'read' : ''}">${ msg.is_read ? '✓✓' : '✓'}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Send message
     */
    async function sendMessage() {
        const input = document.getElementById('messageInput');
        const messageText = input.value.trim();

        if (!messageText || !currentConversationId) {
            return;
        }

        console.log('Sending message:', messageText);

        // Clear input immediately
        input.value = '';

        // Stop typing indicator
        if (socket) {
            socket.emit('stop_typing', {
                conversationId: currentConversationId,
                receiverId: currentReceiverId
            });
        }

        try {
            // Send via Socket.IO for real-time delivery
            if (socket) {
                socket.emit('send_message', {
                    conversationId: currentConversationId,
                    receiverId: currentReceiverId,
                    message: messageText
                });
            }

            // Also save to database via API
            const response = await window.ArtNest.apiRequest('/chat/messages', {
                method: 'POST',
                body: JSON.stringify({
                    conversation_id: currentConversationId,
                    receiver_id: currentReceiverId,
                    message_text: messageText
                })
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            window.ArtNest.showToast('Failed to send message', 'error');
        }
    }

    /**
     * Handle receiving message
     */
    function handleReceiveMessage(data) {
        console.log('Received message:', data);

        const user = JSON.parse(localStorage.getItem('artnet_user'));

        // If message is for current conversation, add to chat
        if (data.conversation_id === currentConversationId) {
            const container = document.getElementById('messagesContainer');
            const isSent = data.sender_id === user.userId;

            const messageHTML = `
                <div class="message ${isSent ? 'sent' : 'received'}" style="animation: fadeInUp 0.3s ease;">
                    <div class="message-content">
                        ${data.message}
                    </div>
                    <div class="message-time">
                        ${window.ArtNest.formatTime(new Date())}
                        ${isSent ? '✓' : ''}
                    </div>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', messageHTML);
            container.scrollTop = container.scrollHeight;

            // Mark as read if not sent by us
            if (!isSent) {
                markAsRead(currentConversationId);
            }
        }

        // Update conversation list
        loadConversations();
    }

    /**
     * Handle typing input
     */
    function handleTypingInput(e) {
        if (!socket || !currentConversationId || !currentReceiverId) return;

        // Send typing event
        socket.emit('typing', {
            conversationId: currentConversationId,
            receiverId: currentReceiverId
        });

        // Clear previous timeout
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Stop typing after 2 seconds of no input
        typingTimeout = setTimeout(() => {
            socket.emit('stop_typing', {
                conversationId: currentConversationId,
                receiverId: currentReceiverId
            });
        }, 2000);
    }

    /**
     * Handle typing indicator
     */
    function handleTyping(data) {
        if (data.conversationId === currentConversationId) {
            document.getElementById('typingIndicator').style.display = 'flex';
        }
    }

    /**
     * Handle stop typing
     */
    function handleStopTyping(data) {
        if (data.conversationId === currentConversationId) {
            document.getElementById('typingIndicator').style.display = 'none';
        }
    }

    /**
     * Handle message read
     */
    function handleMessageRead(data) {
        console.log('Message read:', data);

        // Update read receipts in current conversation
        if (data.conversationId === currentConversationId) {
            const messages = document.querySelectorAll('.message.sent .message-time');
            messages.forEach(timeEl => {
                if (!timeEl.textContent.includes('✓✓')) {
                    timeEl.innerHTML = timeEl.innerHTML.replace('✓', '✓✓');
                }
            });
        }
    }

    /**
     * Handle user online
     */
    function handleUserOnline(data) {
        console.log('User online:', data.userId);
        
        // Update conversation list
        const convo = conversations.find(c => c.other_user_id === data.userId);
        if (convo) {
            convo.is_online = true;
            displayConversations(conversations);
        }

        // Update current chat if applicable
        if (currentReceiverId === data.userId) {
            updateOnlineStatus(true);
        }
    }

    /**
     * Handle user offline
     */
    function handleUserOffline(data) {
        console.log('User offline:', data.userId);
        
        // Update conversation list
        const convo = conversations.find(c => c.other_user_id === data.userId);
        if (convo) {
            convo.is_online = false;
            displayConversations(conversations);
        }

        // Update current chat if applicable
        if (currentReceiverId === data.userId) {
            updateOnlineStatus(false);
        }
    }

    /**
     * Update online status display
     */
    function updateOnlineStatus(isOnline) {
        const statusText = document.getElementById('statusText');
        const indicator = document.querySelector('.user-status .online-indicator');

        if (isOnline) {
            statusText.textContent = 'Online';
            if (indicator) indicator.style.display = 'inline-block';
        } else {
            statusText.textContent = 'Offline';
            if (indicator) indicator.style.display = 'none';
        }
    }

    /**
     * Mark conversation as read
     */
    async function markAsRead(conversationId) {
        try {
            await window.ArtNest.apiRequest(`/chat/conversations/${conversationId}/read`, {
                method: 'PUT'
            });

            // Emit socket event
            if (socket) {
                socket.emit('mark_conversation_read', {
                    conversationId: conversationId
                });
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    /**
     * Handle file attachment
     */
    async function handleFileAttachment(e) {
        const file = e.target.files[0];
        if (!file) return;

        console.log('Attaching file:', file.name);
        
        // TODO: Implement file upload
        window.ArtNest.showToast('File attachments coming soon!', 'info');
    }

    /**
     * Open new chat modal
     */
    function openNewChatModal() {
        // TODO: Implement new chat modal
        window.ArtNest.showToast('New chat feature coming soon!', 'info');
    }

    /**
     * Cleanup on page unload
     */
    window.addEventListener('beforeunload', () => {
        if (socket) {
            socket.disconnect();
        }
    });

    // Public API
    return {
        init: init,
        openConversation: openConversation
    };
})();

// Expose to global scope
window.ChatManager = ChatManager;

console.log('✅ Chat Manager loaded');
