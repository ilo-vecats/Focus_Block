# Deploy FocusBlock on Render - Complete Guide

This guide will walk you through deploying your FocusBlock application to Render.com step by step.

## Prerequisites

✅ GitHub repository: [https://github.com/ilo-vecats/Focus_Block](https://github.com/ilo-vecats/Focus_Block)  
✅ MongoDB Atlas account (free tier available)  
✅ Render.com account (free tier available)

---

## Step 1: Verify MongoDB Atlas Setup

### 1.1 Get Your MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click on your cluster → **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/focusblock?retryWrites=true&w=majority
   ```
5. **Important:** Replace `<password>` with your actual database password
6. Replace `<dbname>` with `focusblock` (or keep it if already set)

### 1.2 Verify Network Access

1. Go to **"Network Access"** in MongoDB Atlas
2. Make sure you have **"Allow Access from Anywhere"** (0.0.0.0/0) enabled
   - Or add Render's IP ranges (more secure but optional)

---

## Step 2: Deploy Backend on Render

### 2.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select repository: **`ilo-vecats/Focus_Block`**

### 2.2 Configure Backend Service

Fill in the following settings:

- **Name:** `focusblock-backend` (or your preferred name)
- **Environment:** `Node`
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** Leave **empty** (or set to `backend` if you prefer)
- **Build Command:** 
  ```bash
  cd backend && npm install
  ```
- **Start Command:**
  ```bash
  cd backend && npm start
  ```
- **Plan:** `Free` (or paid if you prefer)

### 2.3 Set Environment Variables

Click **"Add Environment Variable"** and add these one by one:

```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/focusblock?retryWrites=true&w=majority
```
*(Use your actual MongoDB Atlas connection string)*

```
JWT_SECRET=your-super-secret-random-string-min-32-characters
```
*(Generate a strong random string - you can use: `openssl rand -base64 32`)*

```
NODE_ENV=production
```

```
PORT=5050
```
*(Render will override this, but good to have)*

**Note:** We'll set `FRONTEND_URL` after deploying the frontend.

### 2.4 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. **Copy the service URL** (e.g., `https://focus-block.onrender.com`)
   - This is your backend API URL
   - **Note:** Your backend URL is: `https://focus-block.onrender.com`

---

## Step 3: Deploy Frontend on Render

### 3.1 Create New Static Site

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub account if not already connected
4. Select repository: **`ilo-vecats/Focus_Block`**

### 3.2 Configure Frontend

Fill in the following settings:

- **Name:** `focusblock-frontend` (or your preferred name)
- **Branch:** `main`
- **Root Directory:** Leave **empty**
- **Build Command:**
  ```bash
  cd frontend && npm install && npm run build
  ```
- **Publish Directory:** `frontend/build`
- **Plan:** `Free`

### 3.3 Set Environment Variables

Add this environment variable:

```
REACT_APP_API_URL=https://focus-block.onrender.com/api
```
*(Use your actual backend URL - example: https://focus-block.onrender.com/api)*

### 3.4 Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for deployment to complete (5-10 minutes)
3. **Copy the site URL** (e.g., `https://focusblock-frontend.onrender.com`)
   - This is your frontend URL

---

## Step 4: Update Backend CORS Settings

### 4.1 Update Backend Environment Variable

1. Go back to your **Backend Service** on Render
2. Click on the service name
3. Go to **"Environment"** tab
4. Add/Update this variable:

```
FRONTEND_URL=https://focus-block-1.onrender.com
```
*(Use your actual frontend URL - example: https://focus-block-1.onrender.com)*

**✅ Your Frontend URL:** `https://focus-block-1.onrender.com`  
**✅ Your Backend URL:** `https://focus-block.onrender.com`

**Note:** The backend CORS is now configured to automatically allow Render domains, but setting FRONTEND_URL explicitly is recommended.

### 4.2 Redeploy Backend

1. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
2. This ensures CORS is properly configured

---

## Step 5: Test Your Deployment

### 5.1 Test Frontend

1. Visit your frontend URL: `https://focusblock-frontend.onrender.com`
2. Try registering a new user
3. Try logging in
4. Create a focus session
5. Add blocked sites

### 5.2 Check Backend Logs

1. Go to Render dashboard → Your backend service
2. Click **"Logs"** tab
3. Verify no errors
4. You should see: `MongoDB connected` and `Server running on port 5050`

---

## Step 6: Create Admin User (Optional)

To create an admin user for testing:

### Option 1: Via MongoDB Atlas

1. Go to MongoDB Atlas → **"Browse Collections"**
2. Find your database → `users` collection
3. Find your user document
4. Edit and change `role` from `"USER"` to `"ADMIN"`

### Option 2: Via MongoDB Compass

1. Connect to your MongoDB Atlas cluster
2. Navigate to `users` collection
3. Update document: `{ role: "ADMIN" }`

---

## Environment Variables Summary

### Backend (Render Web Service):
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/focusblock?retryWrites=true&w=majority
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
PORT=5050
```

### Frontend (Render Static Site):
```
REACT_APP_API_URL=https://focus-block.onrender.com/api
```

**✅ Your Backend URL:** `https://focus-block.onrender.com`  
**✅ Frontend API URL:** `https://focus-block.onrender.com/api`

---

## Troubleshooting

### Backend won't start
- ✅ Check logs in Render dashboard
- ✅ Verify `MONGO_URI` is correct (no extra spaces)
- ✅ Ensure `JWT_SECRET` is set
- ✅ Check MongoDB Atlas network access allows Render IPs

### Frontend can't connect to backend
- ✅ Verify `REACT_APP_API_URL` matches your backend URL exactly
- ✅ Check CORS settings in backend (`FRONTEND_URL` must match frontend URL)
- ✅ Check browser console for errors
- ✅ Verify backend is running (check logs)

### MongoDB connection fails
- ✅ Verify network access in MongoDB Atlas allows all IPs (0.0.0.0/0)
- ✅ Check connection string format
- ✅ Ensure database user has correct permissions
- ✅ Verify password doesn't have special characters that need URL encoding

### 404 errors on frontend
- ✅ Verify build command completed successfully
- ✅ Check that `Publish Directory` is set to `frontend/build`
- ✅ Ensure React Router is configured for client-side routing
- ✅ Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### CORS errors
- ✅ Ensure `FRONTEND_URL` in backend matches frontend URL exactly
- ✅ Check backend CORS configuration in `server.js`
- ✅ Redeploy backend after changing `FRONTEND_URL`

---

## Cost Estimate

### Free Tier:
- ✅ Render Web Service: **Free** (spins down after 15 min inactivity)
- ✅ Render Static Site: **Free**
- ✅ MongoDB Atlas: **Free** (512MB storage)

**Total: $0/month** (with limitations)

### Paid Tier (if needed):
- Render Web Service: **$7/month** (always on)
- MongoDB Atlas: Free tier usually sufficient
- **Total: ~$7/month**

---

## Next Steps

1. **Custom Domain (Optional):**
   - Add custom domain in Render dashboard
   - Update DNS records
   - Update `FRONTEND_URL` in backend

2. **SSL Certificates:**
   - Render provides free SSL automatically ✅
   - No action needed

3. **Monitoring:**
   - Set up uptime monitoring (UptimeRobot, etc.)
   - Monitor Render logs regularly

4. **Backup:**
   - MongoDB Atlas provides automatic backups on paid plans
   - Consider exporting data regularly

---

## Quick Reference URLs

After deployment, you'll have:

- **Frontend:** `https://your-frontend-url.onrender.com`
- **Backend API:** `https://focus-block.onrender.com` ✅
- **API Health Check:** `https://focus-block.onrender.com/health` ✅
- **API Base URL:** `https://focus-block.onrender.com/api` ✅

---

**Your FocusBlock application is now live! 🚀**

If you encounter any issues, check the troubleshooting section above or review the Render logs.

