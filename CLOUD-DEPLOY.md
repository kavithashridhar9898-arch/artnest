# ☁️ Deploy ArtNest to Internet (Access from Anywhere)

## 🚀 Method 1: Railway (Easiest - 10 Minutes)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
(Opens browser - sign up with GitHub)

### Step 3: Deploy Backend
```bash
cd backend
railway init
railway up
```

**Set Environment Variables:**
```bash
railway variables set DB_HOST=your_database_host
railway variables set DB_USER=root
railway variables set DB_PASSWORD=your_password
railway variables set DB_NAME=artistnetdb
railway variables set JWT_SECRET=your_secret_key
```

**Get Backend URL:**
```bash
railway domain
# Example: https://artnest-backend.up.railway.app
```

### Step 4: Deploy Frontend
```bash
cd ../frontend
railway init
railway up
railway domain
# Example: https://artnest.up.railway.app
```

### Step 5: Update Config
Edit `frontend/js/config.js`:
```javascript
const API_CONFIG = {
  LOCAL_URL: 'http://localhost:3000',
  NETWORK_URL: 'https://artnest-backend.up.railway.app', // Railway backend URL
  CURRENT_MODE: 'NETWORK_URL'
};
```

**Redeploy Frontend:**
```bash
railway up
```

---

## 🌐 Method 2: Vercel + Render (Free Forever)

### Frontend: Vercel

**Install Vercel:**
```bash
npm install -g vercel
```

**Deploy:**
```bash
cd frontend
vercel
```

Follow prompts:
- Project name: `artnest`
- Framework: `Other`
- Build: (leave empty)
- Output: (leave empty)

**Get URL:** `https://artnest.vercel.app`

### Backend: Render

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create artnest --public --source=. --push
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repo
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     DB_HOST=your_host
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=artistnetdb
     JWT_SECRET=your_secret
     NODE_ENV=production
     ```

3. **Update Frontend Config:**
   Edit `frontend/js/config.js`:
   ```javascript
   NETWORK_URL: 'https://artnest-backend.onrender.com'
   ```

4. **Redeploy Frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

---

## ⚡ Method 3: Ngrok (Testing Only - 5 Minutes)

**Install Ngrok:**
```bash
# Using Chocolatey
choco install ngrok

# Or download from: https://ngrok.com/download
```

**Start Servers:**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend  
cd frontend
http-server -p 8080
```

**Expose to Internet:**
```bash
# Terminal 3: Expose Backend
ngrok http 3000
# Copy HTTPS URL: https://abc123.ngrok.io

# Terminal 4: Expose Frontend
ngrok http 8080
# Copy HTTPS URL: https://xyz789.ngrok.io
```

**Update Config:**
```javascript
NETWORK_URL: 'https://abc123.ngrok.io'
```

**Access:** Share the frontend URL (`https://xyz789.ngrok.io`)

⚠️ **Note:** Free ngrok URLs expire after 2 hours

---

## 🗄️ Database Options for Cloud

Your local MySQL won't work in cloud. Use:

### Option 1: Railway PostgreSQL (Easiest)
```bash
railway add
# Select PostgreSQL
railway variables
# Auto-generates DATABASE_URL
```

**Update backend to use PostgreSQL:**
```bash
npm install pg
```

### Option 2: PlanetScale (MySQL Compatible - FREE)
1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Add to Railway/Render env variables

### Option 3: Render PostgreSQL (FREE)
1. On Render dashboard
2. New → PostgreSQL
3. Copy Internal Database URL
4. Add to your web service env variables

---

## 📝 Complete Railway Deployment Script

Save as `deploy.bat`:

```batch
@echo off
echo ========================================
echo   Deploying ArtNest to Railway
echo ========================================

echo Installing Railway CLI...
call npm install -g @railway/cli

echo.
echo Logging in to Railway...
call railway login

echo.
echo ========================================
echo   Deploying Backend...
echo ========================================
cd backend
call railway init --name artnest-backend
call railway up

echo.
echo Please set environment variables:
echo railway variables set DB_HOST=your_host
echo railway variables set DB_USER=root
echo railway variables set DB_PASSWORD=your_password
echo railway variables set DB_NAME=artistnetdb
echo railway variables set JWT_SECRET=your_secret
echo.
pause

echo Getting backend URL...
call railway domain

echo.
echo ========================================
echo   Deploying Frontend...
echo ========================================
cd ../frontend
call railway init --name artnest-frontend
call railway up
call railway domain

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy backend URL from above
echo 2. Update frontend/js/config.js NETWORK_URL
echo 3. Run: cd frontend && railway up
echo 4. Share your frontend URL!
echo.
pause
```

---

## 🎯 Recommended Setup

**For Production (Free):**
- ✅ Frontend: Vercel
- ✅ Backend: Render
- ✅ Database: PlanetScale

**For Quick Testing:**
- ✅ Ngrok (both frontend + backend)

**For Full Control:**
- ✅ Railway (everything in one place)

---

## 🔒 Security Checklist

Before deploying:

1. **Update CORS in backend/server.js:**
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend.vercel.app', 'https://your-domain.com'],
     credentials: true
   }));
   ```

2. **Add .gitignore:**
   ```
   node_modules/
   .env
   *.log
   ```

3. **Environment Variables:**
   - Never commit `.env` file
   - Add all secrets to Railway/Render dashboard

4. **Database:**
   - Use cloud database (not localhost)
   - Enable SSL connections
   - Whitelist cloud service IPs

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Update DB_HOST to cloud database URL |
| "CORS error" | Add frontend URL to CORS whitelist |
| "502 Bad Gateway" | Check backend logs: `railway logs` |
| "Build failed" | Ensure `package.json` has all dependencies |
| "Port already in use" | Cloud services auto-assign ports (use `process.env.PORT`) |

---

## 💰 Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Railway** | $5 credit/month | $20/month |
| **Vercel** | 100GB bandwidth | $20/month |
| **Render** | 750 hours/month | $7/month |
| **Ngrok** | 1 process, 2hr sessions | $8/month |
| **PlanetScale** | 5GB storage | $29/month |

**Recommended Free Stack:** $0/month
- Vercel (Frontend)
- Render (Backend)
- PlanetScale (Database)

---

Need help with deployment? Choose a method above and I'll guide you through it! 🚀
