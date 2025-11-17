-- ==========================================
-- ArtNest Database Schema (PostgreSQL)
-- Artist-Venue Booking Platform
-- ==========================================

-- ==========================================
-- Users Table
-- Stores authentication and basic user info
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('artist', 'venue')),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_pic VARCHAR(255),
    cover_photo VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ==========================================
-- Artist Profiles Table
-- Extended profile information for artists
-- ==========================================
CREATE TABLE IF NOT EXISTS artist_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    stage_name VARCHAR(100),
    genre VARCHAR(100),
    bio TEXT,
    experience_years INT,
    price_range VARCHAR(50),
    performance_duration VARCHAR(50),
    equipment_provided BOOLEAN DEFAULT FALSE,
    spotify_link VARCHAR(255),
    youtube_link VARCHAR(255),
    instagram_link VARCHAR(255),
    city VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_shows INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id ON artist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_genre ON artist_profiles(genre);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_rating ON artist_profiles(rating);

-- ==========================================
-- Venue Profiles Table
-- Extended profile information for venues
-- ==========================================
CREATE TABLE IF NOT EXISTS venue_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    venue_name VARCHAR(150) NOT NULL,
    venue_type VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    capacity INT,
    amenities TEXT,
    price_per_day DECIMAL(10,2),
    sound_system BOOLEAN DEFAULT FALSE,
    lighting_system BOOLEAN DEFAULT FALSE,
    backstage_area BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_bookings INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_venue_profiles_user_id ON venue_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_city ON venue_profiles(city);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_venue_type ON venue_profiles(venue_type);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_rating ON venue_profiles(rating);

-- ==========================================
-- Booking Requests Table
-- Manages booking requests between artists and venues
-- ==========================================
CREATE TABLE IF NOT EXISTS booking_requests (
    id SERIAL PRIMARY KEY,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('venue_to_artist', 'artist_to_venue')),
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    duration_hours INT,
    budget DECIMAL(10,2),
    event_type VARCHAR(100),
    special_requirements TEXT,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_sender_id ON booking_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_receiver_id ON booking_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_event_date ON booking_requests(event_date);

-- ==========================================
-- Media Posts Table
-- Stores images and videos uploaded by users
-- ==========================================
CREATE TABLE IF NOT EXISTS media_posts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    file_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    title VARCHAR(200),
    description TEXT,
    tags VARCHAR(255),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_posts_user_id ON media_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_posts_media_type ON media_posts(media_type);
CREATE INDEX IF NOT EXISTS idx_media_posts_created_at ON media_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_media_posts_likes_count ON media_posts(likes_count);

-- ==========================================
-- Media Likes Table
-- Tracks likes on media posts
-- ==========================================
CREATE TABLE IF NOT EXISTS media_likes (
    id SERIAL PRIMARY KEY,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (media_id, user_id),
    FOREIGN KEY (media_id) REFERENCES media_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_likes_media_id ON media_likes(media_id);
CREATE INDEX IF NOT EXISTS idx_media_likes_user_id ON media_likes(user_id);

-- ==========================================
-- Media Comments Table
-- Stores comments on media posts
-- ==========================================
CREATE TABLE IF NOT EXISTS media_comments (
    id SERIAL PRIMARY KEY,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_comments_media_id ON media_comments(media_id);
CREATE INDEX IF NOT EXISTS idx_media_comments_user_id ON media_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_media_comments_created_at ON media_comments(created_at);

-- ==========================================
-- Chat Conversations Table
-- Manages conversation threads between users
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id SERIAL PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message TEXT,
    last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user1_id ON chat_conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user2_id ON chat_conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message_time ON chat_conversations(last_message_time);

-- ==========================================
-- Chat Messages Table
-- Stores individual chat messages
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(10) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio')),
    file_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);

-- ==========================================
-- Reviews Table
-- Stores reviews and ratings between users
-- ==========================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    booking_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES booking_requests(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- ==========================================
-- Notifications Table
-- Stores system notifications for users
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ==========================================
-- User Settings Table
-- Stores user preferences and settings
-- ==========================================
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    booking_alerts BOOLEAN DEFAULT TRUE,
    message_alerts BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    show_email BOOLEAN DEFAULT FALSE,
    show_phone BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- ==========================================
-- END OF SCHEMA
-- ==========================================
