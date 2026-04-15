const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Database Connection (MongoDB Atlas)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes);

// Protected Route
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Welcome to the Protected Dashboard!',
    userId: req.user.id
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Auth Server running on port ${PORT}`);
});
