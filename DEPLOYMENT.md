# 🚀 ArtNest Deployment Guide

## Quick Start - Local Network Access

### Step 1: Start the Backend Server
```bash
cd backend
npm start
```

The server will display your **Network IP address** like:
```
🌐 Network: http://192.168.1.100:3000
```

### Step 2: Serve Frontend Files

**Option A - Using Node.js http-server (Recommended)**
```bash
# Install http-server globally (one time only)
npm install -g http-server

# Navigate to frontend folder
cd frontend

# Start the server
http-server -p 8080 -c-1
```

**Option B - Using Python**
```bash
cd frontend
python -m http.server 8080
```

### Step 3: Update API Configuration

1. Open `frontend/js/config.js`
2. Replace `YOUR_IP` with your network IP (shown when backend starts)
3. Change `CURRENT_MODE: 'LOCAL_URL'` to `CURRENT_MODE: 'NETWORK_URL'`

Example:
```javascript
NETWORK_URL: 'http://192.168.1.100:3000',
CURRENT_MODE: 'NETWORK_URL'
```

### Step 4: Access from Other Devices

**On the same WiFi network:**
- Open browser on any device
- Go to: `http://YOUR_IP:8080`
- Example: `http://192.168.1.100:8080`

---

## Cloud Deployment Options

### 🌟 Option 1: Vercel + Render (Free)

**Frontend (Vercel):**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set root directory to `frontend`
5. Deploy

**Backend (Render):**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set root directory to `backend`
5. Add environment variables (DB credentials)
6. Deploy

### 🌟 Option 2: Netlify + Railway (Free)

**Frontend (Netlify):**
1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repo, set build dir to `frontend`
4. Deploy

**Backend (Railway):**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Deploy backend
4. Add MySQL database
5. Set environment variables

### 🌟 Option 3: Heroku (All-in-One)

**Requirements:**
- Heroku account
- Heroku CLI installed

**Steps:**
1. Create Heroku app
2. Add MySQL addon (JawsDB or ClearDB)
3. Update config for Heroku
4. Push to Heroku
5. Run database migrations

### 🌟 Option 4: AWS/Azure/GCP (Professional)

**For production use:**
- AWS EC2 + RDS
- Azure App Service + MySQL
- Google Cloud Run + Cloud SQL

---

## Environment Setup

### Backend `.env` File
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=artistnetdb
JWT_SECRET=your_secret_key
NODE_ENV=production
```

### Frontend API Config
Update `frontend/js/config.js` with production URLs

---

## Firewall Settings (Windows)

If other devices can't connect:

1. Open Windows Firewall
2. Click "Advanced settings"
3. Add Inbound Rule:
   - Port: 3000 (backend)
   - Port: 8080 (frontend)
   - Allow connection
   - Apply to all profiles

---

## Troubleshooting

**Can't connect from other devices?**
- Check firewall settings
- Ensure all devices on same WiFi
- Verify IP address is correct
- Try `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

**Database connection fails?**
- Update MySQL to allow remote connections
- Check DB_HOST in .env file

**CORS errors?**
- Backend already configured for CORS
- Check API_BASE_URL in frontend config

---

## Quick Commands

```bash
# Find your IP (Windows)
ipconfig

# Find your IP (Mac/Linux)
ifconfig

# Test backend is running
curl http://localhost:3000/api/health

# Kill process on port
npx kill-port 3000 8080
```

---

## Recommended for Production

✅ Use HTTPS (SSL certificates)
✅ Environment variables for secrets
✅ Database backups
✅ CDN for static files
✅ Load balancing for high traffic
✅ Error monitoring (Sentry)
✅ Analytics (Google Analytics)
