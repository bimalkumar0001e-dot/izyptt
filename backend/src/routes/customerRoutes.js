const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { verifyToken } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/admin.controller');
const upload = require('../middlewares/upload');

// 🔐 Pickup & Drop Service
router.post('/pickup-drop/book', verifyToken, customerController.bookPickup);
router.get('/pickup-drop/my', verifyToken, customerController.getMyPickups);
router.get('/pickup-drop/:id', verifyToken, customerController.viewPickupDetails);
router.delete('/pickup-drop/:id', verifyToken, customerController.cancelPickup);

// 🔐 Profile Management
router.get('/profile', verifyToken, customerController.viewProfile);
router.put('/profile', verifyToken, customerController.updateProfile);

// 🔐 Address Management
router.get('/addresses', verifyToken, customerController.viewAddresses);
router.post('/addresses', verifyToken, customerController.addNewAddress);
router.put('/addresses/:addressId', verifyToken, customerController.updateAddress);
router.delete('/addresses/:addressId', verifyToken, customerController.deleteAddress);

// 🔓 Restaurant & Product Browsing (public)
router.get('/restaurants', customerController.viewAllRestaurants);
router.get('/restaurants/search', customerController.searchRestaurants);
router.get('/restaurants/:id', customerController.viewRestaurantDetails);
router.get('/restaurants/:restaurantId/products', customerController.viewRestaurantProducts);

router.get('/products', customerController.viewAllProducts);
router.get('/products/search', customerController.searchProduct);
router.get('/products/:id', customerController.viewProductDetails);

// Add: Section search by name (public)
router.get('/sections/search', adminController.searchSectionsByName);

// 🔓 Cart Management (should be protected)
router.get('/cart', verifyToken, customerController.viewCartItems);
router.post('/cart', verifyToken, customerController.addItemToCart);
router.put('/cart', verifyToken, customerController.updateCartItemQuantity);
router.delete('/cart/:productId', verifyToken, customerController.removeItemFromCart);

// 🔐 Order Management
router.post('/orders', verifyToken, customerController.placeNewOrder);
router.get('/orders', verifyToken, customerController.viewAllOrders);
router.get('/orders/:id', verifyToken, customerController.viewOrderDetails);
router.get('/orders/:id/track', verifyToken, customerController.trackOrderStatus);
router.delete('/orders/:id', verifyToken, customerController.cancelOrder);
router.post('/orders/:id/cancel', verifyToken, customerController.cancelOrder);
router.post('/orders/:id/rate', verifyToken, customerController.rateDeliveredOrder);

// Add product review for an order item (single image)
router.post(
  '/orders/:orderId/rate-product/:productId',
  verifyToken,
  upload.single('image'),
  customerController.addProductReview
);

// 🔐 Payments
router.get('/payment-methods', verifyToken, customerController.viewPaymentMethods);

// 🔐 Promotions and Offers
router.get('/offers', verifyToken, customerController.viewAvailableOffers);
router.get('/offers/validate', verifyToken, customerController.validatePromoCode);
router.post('/offers/apply', verifyToken, customerController.applyPromoCodeToCart);

// // 🔐 Notifications
// router.get('/notifications', verifyToken, customerController.viewNotifications);

// 🔐 Popular Dishes
// router.get('/popular-dishes', adminController.getPopularDishes);

// Public: Get all sections with products (for home page)
router.get('/sections', adminController.viewAllSectionsPublic);

// Favourites (Restaurant)
router.post('/favourites/restaurant/select', verifyToken, customerController.selectFavouriteRestaurant);
router.post('/favourites/restaurant/deselect', verifyToken, customerController.deselectFavouriteRestaurant);
router.get('/favourites/restaurants', verifyToken, customerController.viewAllFavouriteRestaurants);

// Favourites (Food Item)
router.post('/favourites/food/select', verifyToken, customerController.selectFavouriteFoodItem);
router.post('/favourites/food/deselect', verifyToken, customerController.deselectFavouriteFoodItem);
router.get('/favourites/foods', verifyToken, customerController.viewAllFavouriteFoodItems);

module.exports = router;
