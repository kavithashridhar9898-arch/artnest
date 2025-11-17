# 🎵 ArtNest - Artist-Venue Booking Platform

A modern, full-stack web platform connecting performing artists with venue owners for seamless booking management.

## 🚀 Features

### For Artists
- ✨ Create stunning portfolios with images and videos
- 📅 Manage booking requests from venues
- 💬 Real-time chat with venue owners
- ⭐ Build reputation through ratings and reviews
- 🎤 Showcase performances and social media links

### For Venues
- 🏛️ Create detailed venue profiles with amenities
- 🔍 Browse and book talented artists
- 📊 Track booking history and analytics
- 💬 Direct communication with artists
- ⭐ Review artists after performances

### Platform Features
- 🔐 Secure authentication with JWT
- 💬 Real-time chat with Socket.IO
- 📱 Fully responsive design
- 🎨 Modern UI with smooth animations
- 📤 File uploads for media and profiles
- 🔔 Real-time notifications
- ⚡ Fast and efficient MySQL database

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

### Frontend
- **Vanilla JavaScript** - No framework overhead
- **HTML5/CSS3** - Modern markup and styling
- **Socket.IO Client** - Real-time updates
- **CSS Animations** - Smooth, GPU-accelerated

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd artnest
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup
```bash
# Login to MySQL
mysql -u root -p
# Enter password: @Gunther89089

# Run the schema
mysql -u root -p < database/schema.sql
```

Or manually:
```sql
-- Copy and paste contents of database/schema.sql into MySQL
```

### Step 4: Environment Configuration
The `.env` file is already configured:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=@Gunther89089
DB_NAME=artistnetdb
JWT_SECRET=artnest_secret_key_2024_secure
PORT=3000
UPLOAD_PATH=./backend/uploads
NODE_ENV=development
```

### Step 5: Start Backend Server
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Server will start on: `http://localhost:3000`

### Step 6: Open Frontend
- Option 1: Open `frontend/index.html` directly in browser
- Option 2: Use VS Code Live Server extension
- Option 3: Use any static file server

```bash
# Using Python
cd frontend
python -m http.server 5500

# Or using Node.js http-server
npx http-server frontend -p 5500
```

Frontend will be available at: `http://localhost:5500`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "Test@123",
  "userType": "artist",
  "fullName": "John Doe",
  "phone": "1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "artist@example.com",
  "password": "Test@123"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": { ... }
  }
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### Artist Endpoints

#### Get All Artists
```http
GET /api/artists?genre=rock&search=john&minRating=4
```

#### Get Artist Profile
```http
GET /api/artists/:id
```

#### Update Artist Profile
```http
PUT /api/artists/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "stageName": "Johnny Rock",
  "genre": "Rock",
  "bio": "Professional rock artist...",
  "experienceYears": 10,
  "priceRange": "$500-$1000",
  ...
}
```

### Venue Endpoints

#### Get All Venues
```http
GET /api/venues?city=NewYork&type=concert_hall
```

#### Get Venue Profile
```http
GET /api/venues/:id
```

#### Update Venue Profile
```http
PUT /api/venues/profile
Authorization: Bearer <token>
```

### Booking Endpoints

#### Create Booking Request
```http
POST /api/bookings/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "receiverId": 5,
  "requestType": "artist_to_venue",
  "eventDate": "2024-12-25",
  "eventTime": "19:00:00",
  "durationHours": 3,
  "budget": 1500,
  "eventType": "Concert",
  "message": "Interested in performing..."
}
```

#### Get Received Requests
```http
GET /api/bookings/received
Authorization: Bearer <token>
```

#### Accept Booking
```http
PUT /api/bookings/:id/accept
Authorization: Bearer <token>
```

#### Reject Booking
```http
PUT /api/bookings/:id/reject
Authorization: Bearer <token>
```

### Media Endpoints

#### Upload Media
```http
POST /api/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [image or video file]
title: "Performance at XYZ"
description: "Amazing show!"
tags: "rock,concert,live"
```

#### Get Media Feed
```http
GET /api/media/feed?limit=20&offset=0
```

#### Like Media
```http
POST /api/media/:id/like
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /api/media/:id/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "comment": "Great performance!"
}
```

### Chat Endpoints

#### Get Conversations
```http
GET /api/chat/conversations
Authorization: Bearer <token>
```

#### Get or Create Conversation
```http
GET /api/chat/conversation/:userId
Authorization: Bearer <token>
```

#### Get Messages
```http
GET /api/chat/messages/:conversationId
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/chat/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": 1,
  "receiverId": 5,
  "message": "Hello!"
}
```

## 🔌 Socket.IO Events

### Client Events (Emit)

```javascript
// Connect with authentication
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

// Join conversation
socket.emit('join_conversation', { conversationId: 1 });

// Send message
socket.emit('send_message', {
  conversationId: 1,
  receiverId: 5,
  message: 'Hello!',
  messageType: 'text'
});

// Typing indicator
socket.emit('typing', { conversationId: 1, receiverId: 5 });
socket.emit('stop_typing', { conversationId: 1, receiverId: 5 });

// Mark as read
socket.emit('message_read', { 
  conversationId: 1, 
  messageId: 10, 
  senderId: 5 
});
```

### Server Events (Listen)

```javascript
// Receive message
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});

// User online/offline
socket.on('user_online', (data) => {
  console.log('User online:', data.userId);
});

socket.on('user_offline', (data) => {
  console.log('User offline:', data.userId);
});

// Typing indicators
socket.on('user_typing', (data) => {
  console.log('User typing in conversation:', data.conversationId);
});

// Message read receipt
socket.on('message_read_receipt', (data) => {
  console.log('Message read:', data);
});

// New message notification
socket.on('new_message_notification', (data) => {
  console.log('New message from:', data.senderName);
});
```

## 🧪 Testing

### Create Test Accounts

```bash
# Artist Account
Email: singer@test.com
Password: Test@123
Type: artist

# Venue Account
Email: venue@test.com
Password: Test@123
Type: venue
```

### Testing Checklist

- [x] User Registration (both types)
- [x] Login/Logout
- [x] Profile Creation and Editing
- [x] Browse Artists/Venues with Filters
- [x] Send Booking Request (both directions)
- [x] Accept/Reject Booking
- [x] Upload Media (images and videos)
- [x] Like and Comment on Media
- [x] Real-time Chat between Users
- [x] Typing Indicators
- [x] Online/Offline Status
- [x] Message Read Receipts
- [x] Notifications System
- [x] Review and Rating System
- [x] Search Functionality
- [x] Responsive Design

## 📁 Project Structure

```
artnest/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── artistController.js   # Artist management
│   │   ├── venueController.js    # Venue management
│   │   ├── bookingController.js  # Bookings
│   │   ├── mediaController.js    # Media uploads
│   │   └── chatController.js     # Chat management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── upload.js             # Multer config
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── artists.js            # Artist routes
│   │   ├── venues.js             # Venue routes
│   │   ├── bookings.js           # Booking routes
│   │   ├── media.js              # Media routes
│   │   └── chat.js               # Chat routes
│   ├── socket/
│   │   └── chatSocket.js         # Socket.IO handler
│   ├── uploads/                  # Uploaded files
│   └── server.js                 # Main server
├── frontend/
│   ├── css/
│   │   ├── main.css              # Main styles
│   │   ├── animations.css        # Animations
│   │   └── chat.css              # Chat styles
│   ├── js/
│   │   ├── app.js                # Main app logic
│   │   ├── auth.js               # Auth functions
│   │   ├── bookings.js           # Booking management
│   │   ├── media.js              # Media functions
│   │   ├── chat.js               # Chat functions
│   │   └── animations.js         # Animation controls
│   ├── index.html                # Landing page
│   ├── login.html                # Login page
│   ├── signup.html               # Signup page
│   ├── artist-dashboard.html     # Artist dashboard
│   ├── venue-dashboard.html      # Venue dashboard
│   ├── profile.html              # Profile page
│   ├── media.html                # Media gallery
│   └── chat.html                 # Chat interface
├── database/
│   └── schema.sql                # Database schema
├── package.json                  # Dependencies
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## 🎨 Frontend Features

### Animations
- Logo glow and pulse effects
- Floating musical notes
- Card hover lift effects
- Ripple button clicks
- Smooth page transitions
- Skeleton loading screens
- Toast notifications
- Modal slide-ins

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px
- Touch-friendly UI
- Adaptive navigation

## 🔒 Security Features

- JWT authentication with 24h expiry
- Password hashing with bcrypt (12 rounds)
- SQL injection prevention
- XSS protection
- CORS configuration
- File upload validation
- Input sanitization
- Rate limiting ready

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
# Or check Services on Windows

# Test connection
mysql -u root -p
```

### Port Already in Use
```bash
# Change port in .env file
PORT=3001

# Or kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Socket.IO Not Connecting
- Ensure backend server is running
- Check JWT token is valid
- Verify CORS settings
- Check browser console for errors

## 📝 License

This project is licensed under the ISC License.

## 👥 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check server logs
4. Verify database connection

## 🚀 Deployment

### Backend Deployment
```bash
# Set production environment
NODE_ENV=production

# Use process manager
npm install -g pm2
pm2 start backend/server.js --name artnest
pm2 save
pm2 startup
```

### Frontend Deployment
- Deploy to any static hosting (Netlify, Vercel, GitHub Pages)
- Update API URLs in frontend JavaScript files

## 📈 Future Enhancements

- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark/Light mode toggle
- [ ] Video call integration
- [ ] Calendar sync
- [ ] Export reports
- [ ] Mobile apps (React Native)

---

Built with ❤️ for the ArtNest community
