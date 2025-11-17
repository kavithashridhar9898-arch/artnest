#!/bin/bash

echo "========================================"
echo "  ArtNest Cloud Deployment Script"
echo "========================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    git branch -M main
fi

echo ""
echo "========================================"
echo "Step 1: Push to GitHub"
echo "========================================"
echo ""
echo "Creating GitHub repository..."
gh repo create artnest --public --source=. --push

echo ""
echo "========================================"
echo "Step 2: Deploy Backend to Render"
echo "========================================"
echo ""
echo "Go to: https://render.com"
echo ""
echo "1. Sign up/Login with GitHub"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Select your 'artnest' repository"
echo "4. Configure:"
echo "   - Name: artnest-backend"
echo "   - Build Command: npm install"
echo "   - Start Command: node backend/server.js"
echo "   - Plan: Free"
echo ""
echo "5. Add Environment Variables:"
echo "   DB_HOST=<your_database_host>"
echo "   DB_USER=root"
echo "   DB_PASSWORD=@Gunther89089"
echo "   DB_NAME=artistnetdb"
echo "   JWT_SECRET=<generate_random_string>"
echo "   PORT=3000"
echo ""
echo "6. Click 'Create Web Service'"
echo ""
read -p "Press Enter after backend is deployed and copy the URL..."

echo ""
echo "========================================"
echo "Step 3: Deploy Frontend to Vercel"
echo "========================================"
echo ""

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

read -p "Enter your Render backend URL (e.g., https://artnest-backend.onrender.com): " BACKEND_URL

# Update config.js with backend URL
echo "Updating frontend configuration..."
cat > frontend/js/config.js << EOF
// API Configuration
const API_CONFIG = {
  LOCAL_URL: 'http://localhost:3000',
  NETWORK_URL: '${BACKEND_URL}',
  CURRENT_MODE: 'NETWORK_URL' // Change to 'LOCAL_URL' for local development
};

// Set the API base URL globally
window.API_BASE_URL = API_CONFIG[API_CONFIG.CURRENT_MODE];

console.log('API Base URL:', window.API_BASE_URL);
EOF

echo "Committing changes..."
git add frontend/js/config.js
git commit -m "Update API configuration for production"
git push

echo ""
echo "Deploying frontend to Vercel..."
cd frontend
vercel --prod

echo ""
echo "========================================"
echo "  Deployment Complete! 🎉"
echo "========================================"
echo ""
echo "Your website is now running 24/7!"
echo ""
echo "Backend: ${BACKEND_URL}"
echo "Frontend: Check Vercel output above for URL"
echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Set up cloud database (Neon/PlanetScale)"
echo "2. Update Render environment variables"
echo "3. Test your live website"
echo ""
