require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
connectDB();

// CORS configuration - allow frontend URL from environment or default to localhost
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://focus-block-1.onrender.com" // Your frontend URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // In production, log but allow if it's a known frontend domain
      if (origin.includes('onrender.com') || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blocked', require('./routes/blocked'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/sessions', require('./routes/sessions'));

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
