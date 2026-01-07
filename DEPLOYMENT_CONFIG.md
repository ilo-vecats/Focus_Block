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
FRONTEND_URL=https://your-frontend-url.onrender.com
NODE_ENV=production
PORT=5050
```

**Note:** Update `FRONTEND_URL` after you deploy your frontend.

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

