# Quick Fix - Backend 404 Error

## Problem
Backend is returning 404 for API routes. This means the backend hasn't been redeployed with the latest code from GitHub.

## Solution: Redeploy Backend on Render

### Step 1: Add Environment Variable
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service: **`focus-block`**
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://focus-block-1.onrender.com`
6. Click **"Save Changes"**

### Step 2: Force Redeploy
1. Still in your backend service
2. Go to **"Manual Deploy"** tab (or click the three dots menu)
3. Click **"Clear build cache & deploy"**
4. Wait for deployment to complete (3-5 minutes)

### Step 3: Verify Frontend Environment Variable
1. Go to your frontend service: **`focus-block-1`**
2. Go to **"Environment"** tab
3. Make sure you have:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://focus-block.onrender.com/api`
   - **Important:** Must include `/api` at the end!

### Step 4: Test
1. Wait for backend deployment to complete
2. Check backend logs - you should see: `MongoDB connected` and `Server running on port 5050`
3. Try registering again on your frontend

## Why This Happened
The backend code on Render is outdated. When you push to GitHub, Render doesn't automatically redeploy. You need to manually trigger a redeploy, especially after code changes.

## Verify Backend is Working
Test these URLs in your browser:

1. **Health Check:** https://focus-block.onrender.com/health
   - Should return: `{"success":true,"message":"Server is running"}`

2. **API Endpoint:** https://focus-block.onrender.com/api/auth/register
   - Should return a validation error (not 404) - this means the route exists

If you still get 404, the backend hasn't redeployed yet. Wait a few more minutes and try again.

