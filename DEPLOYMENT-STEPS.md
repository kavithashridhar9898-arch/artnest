# 🚀 ArtNest Deployment - Follow These Steps

## ✅ COMPLETED
- [x] Git initialized
- [x] Initial commit created
- [x] Vercel CLI installed

---

## 📋 STEP 1: Create GitHub Repository (5 minutes)

1. Go to: **https://github.com/new**
2. Repository name: `artnest`
3. Make it **Public**
4. **DO NOT** add README, .gitignore, or license
5. Click **Create repository**

6. Copy the commands shown and run in terminal:
```bash
cd c:/Users/LENOVO/Documents/web/artnest
git remote add origin https://github.com/YOUR_USERNAME/artnest.git
git branch -M main
git push -u origin main
```

---

## 📋 STEP 2: Setup Cloud Database - Neon (5 minutes)

1. Go to: **https://console.neon.tech/signup**
2. Sign up (free, use GitHub or email)
3. Create new project: `artnest-db`
4. Region: Choose closest to you
5. Click **Create Project**

6. **Copy the connection string** - looks like:
```
postgresql://username:password@ep-xxx-xxx.neon.tech/neondb?sslmode=require
```

7. **Important:** Save this connection string - you'll need it!

---

## 📋 STEP 3: Deploy Backend - Render (10 minutes)

1. Go to: **https://dashboard.render.com/register**
2. Sign up with GitHub
3. Click **New +** → **Web Service**
4. Click **Connect a repository** → Select `artnest`

5. Configure:
   - **Name:** `artnest-backend`
   - **Region:** Choose closest
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/server.js`
   - **Instance Type:** `Free`

6. Click **Advanced** → Add Environment Variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `artnest_super_secret_key_2025` |
| `DATABASE_URL` | (paste your Neon connection string) |

7. Click **Create Web Service**

8. **Wait 5-10 minutes** for deployment to complete

9. **Copy your backend URL** - looks like:
```
https://artnest-backend.onrender.com
```

---

## 📋 STEP 4: Update Database Connection (2 minutes)

Your backend needs to use PostgreSQL instead of MySQL. Run this in terminal:

```bash
cd c:/Users/LENOVO/Documents/web/artnest
npm install pg
```

Then I'll update your database configuration.

---

## 📋 STEP 5: Deploy Frontend - Vercel (5 minutes)

After Step 4 is complete, run:

```bash
cd c:/Users/LENOVO/Documents/web/artnest/frontend
vercel
```

Follow prompts:
- **Set up and deploy:** Yes
- **Which scope:** (your account)
- **Link to existing project:** No
- **Project name:** `artnest`
- **Directory:** `./`
- **Override settings:** No

Copy the **Production URL** shown (e.g., `https://artnest.vercel.app`)

---

## 📋 STEP 6: Connect Frontend to Backend (2 minutes)

I'll update your config.js with the Render backend URL, then redeploy.

---

## 🎉 DONE!

Your website will be running 24/7 on:
- **Frontend:** https://artnest.vercel.app
- **Backend:** https://artnest-backend.onrender.com
- **Database:** Neon cloud PostgreSQL

---

## 🔴 CURRENT STEP: 

**START WITH STEP 1** - Create GitHub repository

When you're done with Step 1, let me know and we'll continue!
