const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

// Get current user's cart
router.get('/', verifyToken, cartController.getCart);

// Add item to cart
router.post('/add', verifyToken, cartController.addToCart);

// Update cart item quantity
router.put('/item/:id', verifyToken, cartController.updateCartItem);

// Remove item from cart
router.delete('/item/:id', verifyToken, cartController.removeCartItem);

// Clear cart
router.delete('/clear', verifyToken, cartController.clearCart);

module.exports = router;