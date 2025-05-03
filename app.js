require('dotenv').config(); // simpler and works if in the same folder

const express      = require('express');
const mongoose     = require('mongoose');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const path         = require('path');

// Import routes
const favoritesRoutes = require('./routes/favorites');
const apiRoutes = require('./routes/api');

const app = express();

// Standard Middleware
app.use(express.json());       // Parse incoming JSON requests
app.use(cookieParser());       // Parse cookies from requests

// CORS Configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true // Allow cookies to be sent from frontend
}));

// MongoDB Connection
let mongoConnected = false;

// MongoDB Connection with retry
const connectWithRetry = () => {
  console.log('Attempting to connect to MongoDB...');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      mongoConnected = true;
      console.log('✅ Connected to MongoDB');
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err);
      console.log('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// API routes
app.get('/api/status', (_req, res) => {
  res.json({
    message: 'Backend is up and running',
    connectedToMongoDB: mongoConnected,
  });
});

// Mount API routes
app.use('/api/favorites', favoritesRoutes);
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend/dist/frontend/browser')));

// Frontend catch-all route
app.get('*', (req, res) => {
  // Don't serve frontend for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend/dist/frontend/browser/index.html'));
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Server Start
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 Status available at /status`);
});
