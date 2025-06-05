const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
// const orderRoutes = require('./routes/orderRoutes');
// const productRoutes = require('./routes/productRoutes');
const restaurantpartnerRoutes = require('./routes/restaurantpartnerRoutes');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cartRoutes = require('./routes/cartRoutes'); // <-- Add this line
const deliveryboyRoutes = require('./routes/deliveryboyRoutes'); // <-- Add this line

const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();

// CORS middleware - MUST be first
app.use(cors({
  // Add multiple origins to support development and production environments
  origin: [
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://izypt.com',
    'https://www.izypt.com',
    'http://izypt.com',
    'http://www.izypt.com',
    'https://app.izypt.com',
    'http://app.izypt.com',
    'https://izypt-deepak-kumars-projects-78b3af05.vercel.app',
    // Additional common formats for your domain
    'http://izypt.com',
    'https://izypt.vercel.app',
    'https://izypt-git-main-deepak-kumars-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Set-Cookie'] // Expose Set-Cookie for frontend
}));

// If you use cookies for authentication, set them like this in your login/OTP verify endpoints:
// res.cookie('token', token, {
//   httpOnly: true,
//   secure: true,
//   sameSite: 'None', // Required for cross-site cookies
//   domain: '.izypt.com', // Allows all subdomains
// });

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, './restaurant_delv images')));
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/products', productRoutes);
app.use('/api/restaurants', restaurantpartnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/cart', cartRoutes); // <-- Add this line
app.use('/api/delivery', deliveryboyRoutes); // <-- Add this line

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Start the server with port handling
const PORT = process.env.PORT || 5001; // Update default port to 5001

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);