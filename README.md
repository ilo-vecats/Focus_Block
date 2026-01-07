# FocusBlock - Enterprise-Grade Backend System

A full-stack productivity application with a **backend-driven architecture** featuring state management, role-based authorization, centralized error handling, input validation, and comprehensive audit logging.

## 🏗️ Architecture Overview

FocusBlock consists of three main components:

1. **Backend API** (Node.js + Express + MongoDB)
   - RESTful API with enterprise-grade features
   - State machine for focus sessions
   - Role-based access control (RBAC)
   - Centralized error handling
   - Input validation
   - Activity logging

2. **Frontend** (React SPA)
   - User interface for managing blocked sites and focus sessions
   - Real-time statistics dashboard

3. **Chrome Extension** (Manifest V3)
   - Enforces website blocking using Chrome's declarativeNetRequest API
   - Syncs with backend for blocked sites list

## 🎯 Key Features

### 1. Focus Session Lifecycle (State Machine)

Focus sessions follow a strict state machine with validated transitions:

```
CREATED → SCHEDULED → ACTIVE → COMPLETED
         ↘                    ↘
          CANCELLED           CANCELLED
```

**State Transition Rules:**
- ✅ `CREATED` → `SCHEDULED`, `ACTIVE`, or `CANCELLED`
- ✅ `SCHEDULED` → `ACTIVE` or `CANCELLED`
- ✅ `ACTIVE` → `COMPLETED` or `CANCELLED`
- ❌ Cannot `COMPLETE` unless `ACTIVE`
- ❌ Cannot `CANCEL` after `COMPLETED`
- ❌ Cannot `START` twice

**API Endpoints:**
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id/start` - Start session (CREATED/SCHEDULED → ACTIVE)
- `PUT /api/sessions/:id/complete` - Complete session (ACTIVE → COMPLETED)
- `PUT /api/sessions/:id/cancel` - Cancel session
- `PUT /api/sessions/:id/schedule` - Schedule session (CREATED → SCHEDULED)
- `GET /api/sessions` - List sessions (with pagination & filtering)
- `GET /api/sessions/:id` - Get single session
- `DELETE /api/sessions/:id` - Delete session (only CREATED/CANCELLED)

### 2. Role-Based Authorization (RBAC)

**Roles:**
- `USER` - Can only access their own resources
- `ADMIN` - Can access all resources, force operations

**Authorization Rules:**
- Users can only view/edit their own sessions, blocked sites, and stats
- Admins can view all users' data
- Protected routes use `authorize('ADMIN')` middleware

### 3. Centralized Error Handling

Custom error classes with consistent responses:

```javascript
// Error Types
- ValidationError (400) - Invalid input
- UnauthorizedError (401) - Missing/invalid token
- ForbiddenError (403) - Insufficient permissions
- NotFoundError (404) - Resource not found
- ConflictError (409) - Duplicate/resource conflict
- AppError (500) - Generic server errors
```

All errors follow this structure:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "errors": [] // Optional validation errors
  }
}
```

### 4. Input Validation

Server-side validation using `express-validator`:

- **Session creation**: Title, duration, scheduled time validation
- **Blocked sites**: URL format, schedule validation
- **Auth**: Email format, password strength
- **State transitions**: Validated in model methods

### 5. Activity Logging & Auditing

All significant actions are logged to `ActivityLog` collection:

**Logged Actions:**
- `CREATE_SESSION`, `START_SESSION`, `COMPLETE_SESSION`, `CANCEL_SESSION`
- `ADD_BLOCKED_SITE`, `UPDATE_BLOCKED_SITE`, `REMOVE_BLOCKED_SITE`
- `LOGIN`, `REGISTER`

**Log Structure:**
- User ID
- Action type
- Resource type & ID
- Old state → New state
- Timestamp
- Metadata

### 6. Pagination & Filtering

All list endpoints support pagination and filtering:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status (for sessions)
- `isActive` - Filter by active status (for blocked sites)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 📁 Project Structure

```
focusblock-main/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── authorize.js      # RBAC authorization
│   │   ├── errorHandler.js   # Centralized error handling
│   │   └── activityLogger.js # Activity logging middleware
│   ├── models/
│   │   ├── User.js           # User model (with role field)
│   │   ├── Blocked.js        # Blocked sites model
│   │   ├── Stats.js          # Statistics model
│   │   ├── FocusSession.js   # Focus session model (state machine)
│   │   └── ActivityLog.js   # Activity log model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── blocked.js        # Blocked sites routes (with pagination)
│   │   ├── stats.js           # Statistics routes
│   │   └── sessions.js        # Focus session routes
│   ├── utils/
│   │   └── pagination.js     # Pagination helper
│   └── server.js             # Express app setup
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── FocusSessions.jsx  # New sessions page
│       │   └── Statistics.jsx
│       └── ...
└── focusblock-extension/
    └── background.js         # Chrome extension service worker
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or cloud instance)
- Chrome browser (for extension)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and JWT secret:
```env
MONGO_URI=mongodb://localhost:27017/focusblock
JWT_SECRET=your-super-secret-jwt-key
PORT=5050
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5050/api
```

4. Start the development server:
```bash
npm start
```

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `focusblock-extension` directory
5. The extension will sync with the backend when you log in

## 🔐 Creating an Admin User

To create an admin user, you can either:

1. **Via MongoDB shell:**
```javascript
use focusblock
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

2. **Via API (after registration):**
```bash
# First register normally, then update via MongoDB
```

## 📊 API Documentation

### Authentication

**POST /api/auth/register**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**POST /api/auth/login**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Focus Sessions

**GET /api/sessions?page=1&limit=10&status=ACTIVE**
- Returns paginated list of sessions
- Filter by status: `CREATED`, `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`

**POST /api/sessions**
```json
{
  "title": "Deep Work Session",
  "description": "Focus on coding",
  "duration": 25,
  "scheduledStart": "2024-01-15T10:00:00Z" // Optional
}
```

**PUT /api/sessions/:id/start**
- Transitions session to `ACTIVE` state
- Sets `actualStart` timestamp

**PUT /api/sessions/:id/complete**
- Transitions session to `COMPLETED` state
- Sets `actualEnd` timestamp

**PUT /api/sessions/:id/cancel**
- Transitions session to `CANCELLED` state

### Blocked Sites

**GET /api/blocked?page=1&limit=10&isActive=true**
- Returns paginated list of blocked sites

**POST /api/blocked**
```json
{
  "url": "facebook.com",
  "schedule": {
    "enabled": true,
    "startTime": "09:00",
    "endTime": "17:00",
    "days": ["Monday", "Tuesday", "Wednesday"]
  }
}
```

## 🚢 Deployment on Render

### Backend Deployment

1. **Create a new Web Service on Render:**
   - Connect your GitHub repository
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Environment variables:
     - `MONGO_URI` - Your MongoDB Atlas connection string
     - `JWT_SECRET` - Strong random string
     - `PORT` - Render will set this automatically
     - `FRONTEND_URL` - Your frontend URL
     - `NODE_ENV` - `production`

2. **MongoDB Setup:**
   - Use MongoDB Atlas (free tier available)
   - Get connection string and add to Render environment variables

### Frontend Deployment

1. **Create a new Static Site on Render:**
   - Connect your GitHub repository
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/build`
   - Environment variables:
     - `REACT_APP_API_URL` - Your backend URL (e.g., `https://focusblock-backend.onrender.com/api`)

2. **Update CORS in backend:**
   - Set `FRONTEND_URL` in backend environment variables to your frontend URL

### Environment Variables Summary

**Backend (.env on Render):**
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/focusblock
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://your-frontend.onrender.com
NODE_ENV=production
```

**Frontend (Build Environment Variables on Render):**
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

## 🧪 Testing the System

1. **State Machine Validation:**
   - Try to complete a session that's not ACTIVE → Should fail with 400
   - Try to cancel a COMPLETED session → Should fail with 400
   - Try to start an already ACTIVE session → Should fail with 409

2. **Authorization:**
   - Login as USER, try to access another user's session → Should fail with 403
   - Login as ADMIN, should be able to access all sessions

3. **Validation:**
   - Submit invalid email format → Should fail with 400
   - Submit negative duration → Should fail with 400

## 🎓 What Makes This "Enterprise-Grade"

1. **State Management** - Not just CRUD, but business logic with validated transitions
2. **Authorization** - Role-based access control, not just authentication
3. **Error Handling** - Consistent, predictable error responses
4. **Validation** - Server-side validation, never trust the client
5. **Auditing** - Complete activity log for accountability
6. **Scalability** - Pagination, filtering, efficient queries
7. **Observability** - Structured logging, error tracking

## 📝 Trade-offs & Future Improvements

**Current Trade-offs:**
- Single MongoDB instance (no sharding)
- JWT tokens don't expire (7-day expiry, no refresh tokens)
- No rate limiting (could add for production)
- Activity logs stored in same DB (could use separate logging service)

**Future Improvements:**
- Add refresh tokens for better security
- Implement rate limiting
- Add WebSocket support for real-time session updates
- Separate activity logs to dedicated logging service
- Add comprehensive test suite
- Implement caching layer (Redis) for frequently accessed data

## 📄 License

MIT

---

**Built with discipline, not complexity.** This project demonstrates backend engineering maturity through state management, authorization, error handling, validation, and observability—the foundations of enterprise software.
