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
    'https://izypt-deepak-kumars-projects-78b3af05.vercel.app'
  ],
  credentials: true
}));

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

// Start the server
const PORT = process.env.PORT || 5001; // Update default port to 5001
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});