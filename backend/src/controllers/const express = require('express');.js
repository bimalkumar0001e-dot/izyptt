const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const restaurantPartnerController = require('../controllers/restaurantpartner.controller');

// Authentication & Onboarding
router.get('/verification-status', verifyToken, restaurantPartnerController.checkVerificationStatus);
router.post('/upload-documents', verifyToken, restaurantPartnerController.uploadVerificationDocuments);

// Profile Management
router.get('/profile', verifyToken, restaurantPartnerController.viewProfile);
router.put('/profile', verifyToken, restaurantPartnerController.updateProfile);
router.post('/change-password', verifyToken, restaurantPartnerController.changePassword);
router.put('/business-hours', verifyToken, restaurantPartnerController.updateBusinessHours);
router.put('/availability', verifyToken, restaurantPartnerController.updateRestaurantAvailabilityStatus);

// Menu Management
router.get('/products', verifyToken, restaurantPartnerController.viewAllProducts);

// Delivered & Cancelled Orders
router.get('/orders/delivered', verifyToken, restaurantPartnerController.viewAllDeliveredOrders);
router.get('/orders/cancelled', verifyToken, restaurantPartnerController.viewAllCancelledOrders);
router.get('/orders/delivered/:id', verifyToken, restaurantPartnerController.viewSingleDeliveredOrderDetails);

// Order Management
router.get('/orders', verifyToken, restaurantPartnerController.viewAllOrders);
router.get('/orders/:id', verifyToken, restaurantPartnerController.viewOrderDetails);
router.put('/orders/:id/status', verifyToken, restaurantPartnerController.updateOrderStatus);

// Financial Management
router.get('/earnings/report', verifyToken, restaurantPartnerController.viewEarningReports);
router.get('/earnings/daily', verifyToken, restaurantPartnerController.viewDailyEarnings);
router.get('/earnings/monthly', verifyToken, restaurantPartnerController.viewMonthlyEarnings);

// Notifications
router.get('/notifications', verifyToken, restaurantPartnerController.viewAllNotifications);

module.exports = router;