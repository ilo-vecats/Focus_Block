# Deployment Configuration - Quick Reference

## ✅ Your Backend URL
**Backend:** `https://focus-block.onrender.com`  
**API Base:** `https://focus-block.onrender.com/api`  
**Health Check:** `https://focus-block.onrender.com/health`

## Frontend Environment Variable

When deploying the frontend on Render, set this environment variable:

```
REACT_APP_API_URL=https://focus-block.onrender.com/api
```

## Backend Environment Variables

Your backend on Render should have:

```
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secret-key
FRONTEND_URL=https://focus-block-1.onrender.com
NODE_ENV=production
PORT=5050
```

**✅ Your Frontend URL:** `https://focus-block-1.onrender.com`  
**✅ Your Backend URL:** `https://focus-block.onrender.com`

**Note:** The backend CORS now automatically allows Render domains, but setting FRONTEND_URL explicitly ensures proper configuration.

## Testing

1. **Test Backend Health:**
   ```bash
   curl https://focus-block.onrender.com/health
   ```
   Should return: `{"success":true,"message":"Server is running"}`

2. **Test API Endpoint:**
   ```bash
   curl https://focus-block.onrender.com/api/auth/login
   ```
   Should return validation error (expected - means API is working)

## Frontend Configuration

The frontend is already configured to use `REACT_APP_API_URL` environment variable. Just set it in Render's environment variables when deploying the frontend.

