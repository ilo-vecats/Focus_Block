# Troubleshooting Guide

## Common Issues and Solutions

### 1. Service Worker Cache Errors (Can be ignored)

**Error:**
```
service-worker.js:18 Uncaught (in promise) TypeError: Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported
service-worker.js:18 Uncaught (in promise) TypeError: Failed to execute 'put' on 'Cache': Request method 'POST' is unsupported
```

**Cause:**
These errors are from browser extensions (like React DevTools, Redux DevTools, or other extensions) trying to cache POST requests. This is **not an issue with your code**.

**Solution:**
- **Ignore these errors** - they don't affect functionality
- If they're annoying, disable browser extensions temporarily
- These are harmless console warnings

### 2. 400 Bad Request on Login/Register

**Error:**
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

**Possible Causes:**

1. **Validation Errors:**
   - Email format is invalid
   - Password is less than 6 characters
   - Username is empty

2. **Error Format Mismatch:**
   - Frontend expects old error format
   - Backend returns new error format

**Solution:**
- Check browser console for detailed error message
- Ensure email is valid format (e.g., `user@example.com`)
- Ensure password is at least 6 characters
- Ensure username is not empty

**Check Error Details:**
Open browser DevTools → Network tab → Click on failed request → Response tab to see validation errors.

### 3. CORS Errors

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:5050/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
- Ensure backend `FRONTEND_URL` environment variable matches your frontend URL
- Check backend `server.js` CORS configuration
- Restart backend server after changing CORS settings

### 4. MongoDB Connection Errors

**Error:**
```
MongoServerError: Authentication failed
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solution:**
- Check `MONGO_URI` in backend `.env` file
- Ensure MongoDB is running (if local)
- Verify MongoDB Atlas connection string (if cloud)
- Check network access settings in MongoDB Atlas

### 5. JWT Token Errors

**Error:**
```
UnauthorizedError: No token, authorization denied
UnauthorizedError: Token is not valid
```

**Solution:**
- Clear browser localStorage: `localStorage.clear()`
- Login again to get new token
- Check `JWT_SECRET` is set in backend `.env`
- Ensure token is being sent in request headers

### 6. State Transition Errors

**Error:**
```
ValidationError: Invalid transition from COMPLETED to CANCELLED
```

**Cause:**
Trying to perform invalid state transition (e.g., cancel a completed session).

**Solution:**
- Check session current status before attempting transition
- Only allow valid transitions:
  - `CREATED` → `SCHEDULED`, `ACTIVE`, or `CANCELLED`
  - `SCHEDULED` → `ACTIVE` or `CANCELLED`
  - `ACTIVE` → `COMPLETED` or `CANCELLED`

### 7. Authorization Errors (403)

**Error:**
```
ForbiddenError: You can only access your own resources
```

**Cause:**
User trying to access another user's resource.

**Solution:**
- Ensure user is accessing their own resources
- If admin access needed, update user role to `ADMIN` in database

### 8. Pagination Issues

**Error:**
- No results showing
- Wrong page numbers

**Solution:**
- Check query parameters: `?page=1&limit=10`
- Verify backend pagination response structure
- Check browser console for API response

### 9. Activity Log Not Working

**Issue:**
Activity logs not appearing in database.

**Solution:**
- Check `ActivityLog` collection exists in MongoDB
- Verify `activityLogger` middleware is being called
- Check backend logs for errors
- Ensure user is authenticated (logs require `req.user`)

### 10. Frontend Not Updating After API Call

**Issue:**
UI doesn't reflect changes after API call.

**Solution:**
- Check API response format matches frontend expectations
- Verify `success: true` in response
- Check if data is in `response.data.data` or `response.data`
- Look for errors in browser console

## Debugging Tips

### 1. Check Backend Logs
```bash
cd backend
npm run dev
# Watch console for errors
```

### 2. Check Frontend Console
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### 3. Test API Directly
Use Postman or curl to test endpoints:
```bash
# Test login
curl -X POST http://localhost:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Check Environment Variables
```bash
# Backend
cd backend
cat .env  # Verify all variables are set

# Frontend
cd frontend
cat .env  # Verify REACT_APP_API_URL is set
```

### 5. Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear localStorage: `localStorage.clear()` in console
- Clear cookies and cache in browser settings

## Getting Help

If issues persist:
1. Check backend logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed (`npm install`)
5. Try restarting both frontend and backend servers

