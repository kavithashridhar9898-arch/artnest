-- ==========================================
-- ArtNest Database Schema
-- Artist-Venue Booking Platform
-- ==========================================

-- Create database
CREATE DATABASE IF NOT EXISTS artistnetdb;
USE artistnetdb;

-- ==========================================
-- Users Table
-- Stores authentication and basic user info
-- ==========================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('artist', 'venue') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_pic VARCHAR(255),
    cover_photo VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_created_at (created_at)
);

-- ==========================================
-- Artist Profiles Table
-- Extended profile information for artists
-- ==========================================
CREATE TABLE artist_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_genre (genre),
    INDEX idx_rating (rating)
);

-- ==========================================
-- Venue Profiles Table
-- Extended profile information for venues
-- ==========================================
CREATE TABLE venue_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_city (city),
    INDEX idx_venue_type (venue_type),
    INDEX idx_rating (rating)
);

-- ==========================================
-- Booking Requests Table
-- Manages booking requests between artists and venues
-- ==========================================
CREATE TABLE booking_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_type ENUM('venue_to_artist', 'artist_to_venue') NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    duration_hours INT,
    budget DECIMAL(10,2),
    event_type VARCHAR(100),
    special_requirements TEXT,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_status (status),
    INDEX idx_event_date (event_date)
);

-- ==========================================
-- Media Posts Table
-- Stores images and videos uploaded by users
-- ==========================================
CREATE TABLE media_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    title VARCHAR(200),
    description TEXT,
    tags VARCHAR(255),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_media_type (media_type),
    INDEX idx_created_at (created_at),
    INDEX idx_likes_count (likes_count)
);

-- ==========================================
-- Media Likes Table
-- Tracks likes on media posts
-- ==========================================
CREATE TABLE media_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_media_like (media_id, user_id),
    FOREIGN KEY (media_id) REFERENCES media_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_media_id (media_id),
    INDEX idx_user_id (user_id)
);

-- ==========================================
-- Media Comments Table
-- Stores comments on media posts
-- ==========================================
CREATE TABLE media_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_media_id (media_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- ==========================================
-- Chat Conversations Table
-- Manages conversation threads between users
-- ==========================================
CREATE TABLE chat_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    last_message TEXT,
    last_message_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_conversation (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user1_id (user1_id),
    INDEX idx_user2_id (user2_id),
    INDEX idx_last_message_time (last_message_time)
);

-- ==========================================
-- Chat Messages Table
-- Stores individual chat messages
-- ==========================================
CREATE TABLE chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('text', 'image', 'video', 'audio') DEFAULT 'text',
    file_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- ==========================================
-- Reviews Table
-- Stores reviews and ratings between users
-- ==========================================
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reviewer_id INT NOT NULL,
    reviewed_id INT NOT NULL,
    booking_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES booking_requests(id) ON DELETE SET NULL,
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_reviewed_id (reviewed_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
);

-- ==========================================
-- Notifications Table
-- Stores system notifications for users
-- ==========================================
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ==========================================
-- Insert Sample Data for Testing
-- ==========================================

-- Note: Run this separately after the schema is created
-- Sample users will have password 'Test@123' (bcrypt hash needs to be generated)

-- END OF SCHEMA
