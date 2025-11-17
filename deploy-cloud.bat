@echo off
echo ========================================
echo   ArtNest Cloud Deployment Guide
echo ========================================
echo.

echo Step 1: Push to GitHub
echo ----------------------------------------
echo Run these commands:
echo.
echo git init
echo git add .
echo git commit -m "Initial commit"
echo git branch -M main
echo gh repo create artnest --public --source=. --push
echo.
pause

echo.
echo ========================================
echo Step 2: Setup Cloud Database (Neon)
echo ========================================
echo.
echo 1. Go to: https://neon.tech
echo 2. Sign up (free)
echo 3. Create new project: "artnest-db"
echo 4. Copy connection string
echo.
echo Example: postgresql://user:pass@ep-xxx.neon.tech/neondb
echo.
pause

echo.
echo ========================================
echo Step 3: Deploy Backend (Render)
echo ========================================
echo.
echo 1. Go to: https://render.com
echo 2. Sign in with GitHub
echo 3. New ^> Web Service
echo 4. Select "artnest" repo
echo 5. Configure:
echo    Name: artnest-backend
echo    Build Command: npm install
echo    Start Command: node backend/server.js
echo    Plan: Free
echo.
echo 6. Add Environment Variables:
echo    DATABASE_URL = ^(your Neon connection string^)
echo    JWT_SECRET = ^(random string^)
echo    NODE_ENV = production
echo    PORT = 3000
echo.
echo 7. Click "Create Web Service"
echo.
echo Wait 5-10 minutes for first deployment...
echo.
pause

echo.
set /p BACKEND_URL="Enter your Render backend URL (e.g., https://artnest-backend.onrender.com): "

echo.
echo ========================================
echo Step 4: Update Frontend Config
echo ========================================
echo.
echo Opening config file...
notepad frontend\js\config.js
echo.
echo Update these lines:
echo   NETWORK_URL: '%BACKEND_URL%',
echo   CURRENT_MODE: 'NETWORK_URL'
echo.
echo Save and close the file.
pause

echo.
echo Committing changes...
git add frontend/js/config.js
git commit -m "Update API URL for production"
git push

echo.
echo ========================================
echo Step 5: Deploy Frontend (Vercel)
echo ========================================
echo.
echo Installing Vercel CLI...
call npm install -g vercel

echo.
echo Deploying to Vercel...
cd frontend
call vercel --prod
cd ..

echo.
echo ========================================
echo   Deployment Complete! 🎉
echo ========================================
echo.
echo Your servers are now running 24/7!
echo.
echo Backend: %BACKEND_URL%
echo Frontend: Check Vercel output above
echo.
echo ========================================
echo Important Notes:
echo ========================================
echo.
echo ✅ Backend runs forever on Render
echo ✅ Frontend runs forever on Vercel
echo ✅ Database runs forever on Neon
echo.
echo ⚠️ Free tier limitations:
echo - Render: May sleep after 15 min inactivity
echo - First request may take 30 seconds to wake up
echo - Upgrade to paid for instant responses
echo.
echo ========================================
pause
