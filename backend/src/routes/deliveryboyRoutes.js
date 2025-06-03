const express = require('express');
const router = express.Router();
const deliveryBoyController = require('../controllers/deliveryBoy.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

// Authentication & Onboarding
router.get('/approval-status', verifyToken, deliveryBoyController.viewApprovalStatus);
router.post('/upload-documents', verifyToken, deliveryBoyController.uploadVerifyingDocuments);

// Profile Management
router.get('/profile', verifyToken, deliveryBoyController.viewProfile);
router.put('/profile', verifyToken, deliveryBoyController.updateProfile);
router.post('/change-password', verifyToken, deliveryBoyController.changePassword);

// Order Management
router.get('/orders', verifyToken, deliveryBoyController.viewAssignedOrders);
router.get('/orders/:id', verifyToken, deliveryBoyController.viewOrderDetails);
router.put('/orders/:id/status', verifyToken, deliveryBoyController.updateOrderStatus);

// Financial Management
router.get('/earnings/report', verifyToken, deliveryBoyController.viewEarningReport);
router.get('/earnings/daily', verifyToken, deliveryBoyController.viewDailyEarnings);

// Notifications
router.get('/notifications', verifyToken, deliveryBoyController.viewNotifications);
router.patch('/notifications/:notificationId/read', verifyToken, deliveryBoyController.markNotificationAsRead);
router.patch('/notifications/mark-all-read', verifyToken, deliveryBoyController.markAllNotificationsAsRead);

// Pickup Management
router.get('/pickups', verifyToken, deliveryBoyController.viewAssignedPickups);
router.get('/pickups/:id', verifyToken, deliveryBoyController.viewPickupDetails);
router.put('/pickups/:id/status', verifyToken, deliveryBoyController.updatePickupStatus);

module.exports = router;