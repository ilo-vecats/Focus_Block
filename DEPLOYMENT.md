# Deployment Guide - FocusBlock on Render

This guide will walk you through deploying FocusBlock to Render.com step by step.

## Prerequisites

1. GitHub account
2. Render.com account (free tier available)
3. MongoDB Atlas account (free tier available) OR local MongoDB

## Step 1: Push to GitHub

### Option A: Create New Repository

1. **Initialize Git (if not already done):**
```bash
cd "/Users/user1/Desktop/focusblock-main 3"
git init
git add .
git commit -m "Initial commit: Enterprise-grade FocusBlock with state management, RBAC, error handling, validation, and audit logging"
```

2. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it: `focusblock-enterprise` (or any name you prefer)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

3. **Push to GitHub:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/focusblock-enterprise.git
git branch -M main
git push -u origin main
```

### Option B: Use Existing Repository

If you already have a GitHub repo:
```bash
git remote add origin YOUR_REPO_URL
git push -u origin main
```

## Step 2: Set Up MongoDB Atlas (Free)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create a Cluster:**
   - Choose "Free" tier (M0)
   - Select a region close to you
   - Click "Create Cluster"

3. **Set Up Database Access:**
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"

4. **Set Up Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for simplicity
   - Or add Render's IP ranges (more secure)

5. **Get Connection String:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `focusblock`
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/focusblock?retryWrites=true&w=majority`

## Step 3: Deploy Backend on Render

1. **Create New Web Service:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your repository: `focusblock-enterprise`

2. **Configure Backend Service:**
   - **Name:** `focusblock-backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `backend` if you want)
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or paid if you prefer)

3. **Set Environment Variables:**
   Click "Add Environment Variable" and add:
   
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/focusblock?retryWrites=true&w=majority
   ```
   (Use your actual MongoDB Atlas connection string)
   
   ```
   JWT_SECRET=your-super-secret-random-string-min-32-characters-long
   ```
   (Generate a strong random string - you can use: `openssl rand -base64 32`)
   
   ```
   NODE_ENV=production
   ```
   
   ```
   PORT=5050
   ```
   (Render will override this, but good to have)
   
   **Note:** We'll set `FRONTEND_URL` after deploying the frontend.

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Copy the service URL (e.g., `https://focusblock-backend.onrender.com`)

## Step 4: Deploy Frontend on Render

1. **Create New Static Site:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Static Site"
   - Connect your GitHub account if not already connected
   - Select your repository: `focusblock-enterprise`

2. **Configure Frontend:**
   - **Name:** `focusblock-frontend`
   - **Branch:** `main`
   - **Root Directory:** Leave empty
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`
   - **Plan:** Free

3. **Set Environment Variables:**
   Add:
   ```
   REACT_APP_API_URL=https://focusblock-backend.onrender.com/api
   ```
   (Use your actual backend URL from Step 3)

4. **Deploy:**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Copy the site URL (e.g., `https://focusblock-frontend.onrender.com`)

## Step 5: Update Backend CORS

1. **Go back to Backend Service on Render:**
   - Click on `focusblock-backend`
   - Go to "Environment" tab
   - Add/Update:
   ```
   FRONTEND_URL=https://focusblock-frontend.onrender.com
   ```
   (Use your actual frontend URL from Step 4)

2. **Redeploy:**
   - Click "Manual Deploy" → "Clear build cache & deploy"
   - This ensures CORS is properly configured

## Step 6: Test Your Deployment

1. **Visit your frontend URL:**
   - `https://focusblock-frontend.onrender.com`

2. **Test the flow:**
   - Register a new user
   - Login
   - Create a focus session
   - Add blocked sites
   - Check statistics

3. **Check backend logs:**
   - Go to Render dashboard → `focusblock-backend` → "Logs"
   - Verify no errors

## Step 7: Create Admin User (Optional)

To create an admin user:

1. **Via MongoDB Atlas:**
   - Go to MongoDB Atlas → "Browse Collections"
   - Find your database → `users` collection
   - Find your user document
   - Edit and change `role` from `"USER"` to `"ADMIN"`

2. **Or via MongoDB Compass:**
   - Connect to your MongoDB Atlas cluster
   - Navigate to `users` collection
   - Update the document: `{ role: "ADMIN" }`

## Troubleshooting

### Backend won't start:
- Check logs in Render dashboard
- Verify `MONGO_URI` is correct
- Ensure `JWT_SECRET` is set
- Check that `PORT` is not conflicting

### Frontend can't connect to backend:
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Ensure `FRONTEND_URL` in backend matches frontend URL
- Check browser console for errors

### MongoDB connection fails:
- Verify network access in MongoDB Atlas allows Render IPs
- Check connection string format
- Ensure database user has correct permissions

### 404 errors:
- Verify build command completed successfully
- Check that `Publish Directory` is set to `frontend/build`
- Ensure React Router is configured for client-side routing

## Environment Variables Summary

### Backend (Render Web Service):
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://focusblock-frontend.onrender.com
NODE_ENV=production
PORT=5050
```

### Frontend (Render Static Site):
```
REACT_APP_API_URL=https://focusblock-backend.onrender.com/api
```

## Next Steps

1. **Custom Domain (Optional):**
   - Add custom domain in Render dashboard
   - Update DNS records
   - Update `FRONTEND_URL` in backend

2. **SSL Certificates:**
   - Render provides free SSL automatically
   - No action needed

3. **Monitoring:**
   - Set up uptime monitoring (UptimeRobot, etc.)
   - Monitor Render logs regularly

4. **Backup:**
   - MongoDB Atlas provides automatic backups on paid plans
   - Consider exporting data regularly

## Cost Estimate

**Free Tier:**
- Render Web Service: Free (spins down after 15 min inactivity)
- Render Static Site: Free
- MongoDB Atlas: Free (512MB storage)

**Total: $0/month** (with limitations)

**Paid Tier (if needed):**
- Render Web Service: $7/month (always on)
- MongoDB Atlas: Free tier usually sufficient
- **Total: ~$7/month**

---

**Your FocusBlock application is now live! 🚀**

