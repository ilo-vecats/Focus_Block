require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
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
