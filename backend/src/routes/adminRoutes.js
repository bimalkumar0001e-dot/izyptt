const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // Use new upload middleware

// Dashboard & System
router.get('/dashboard', adminController.getDashboardStatistics);
router.get('/system-status', adminController.getSystemStatus);
router.put('/system-status', adminController.updateSystemStatus);

// Offer Management
router.post('/offers', upload.single('image'), adminController.createOffer);
router.get('/offers', adminController.getAllOffers);
router.get('/offers/:id', adminController.getOfferDetails);
router.put('/offers/:id', upload.single('image'), adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);
router.patch('/offers/:id/activate', adminController.activateDeactivateOffer);
router.get('/offers/can-use', adminController.canCustomerUseOffer); // New route to check if a customer can use an offer

// User Management - Customers
router.get('/customers', adminController.getAllCustomers);
router.patch('/customers/:id/activate', adminController.activateDeactivateCustomer);
router.get('/customers/:id/orders', adminController.getCustomerOrderHistory);
router.get('/customers/:id/pickups', adminController.getCustomerPickupHistory); // Added route for pickup history

// Delivery Boy Management
router.get('/delivery-boys', adminController.getAllDeliveryBoys);
router.get('/delivery-boys/:id', adminController.getDeliveryBoyDetails);
router.patch('/delivery-boys/:id/activate', adminController.activateDeactivateDeliveryBoy);
// In adminRoutes.js
router.get('/pending-delivery-partners', adminController.getPendingDeliveryPartners);
router.patch('/delivery-boys/:id/approve', adminController.approveDeliveryBoy);

// Restaurant Partner Management
router.get('/restaurants', adminController.getAllRestaurants);
router.get('/restaurants/:id', adminController.getRestaurantDetails);
router.get('/pending-restaurants', adminController.getPendingRestaurants);
router.patch('/restaurants/:id/approve', adminController.approveRestaurant);
router.patch('/restaurants/:id/activate', adminController.activateDeactivateRestaurant);
router.put('/restaurants/:id', adminController.updateRestaurant);

// Order Management
router.get('/orders', verifyToken, adminController.listAllOrders);
router.get('/orders/:id', verifyToken, adminController.viewOrderDetails);
router.patch('/orders/:id/assign-delivery', verifyToken, adminController.assignDeliveryPartner);
// Restore the proper verifyToken middleware for production
router.patch('/orders/:id/status', verifyToken, adminController.updateOrderStatus);
router.patch('/orders/:id/cancel', verifyToken, adminController.cancelOrderWithReason);

// Product Management
router.post('/products', upload.single('image'), adminController.createProduct);
router.get('/products', adminController.viewAllProducts);
router.get('/products/:id', adminController.viewProductDetails);
router.put('/products/:id', upload.single('image'), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/availability', adminController.changeProductAvailability);

// Customer Support
router.get('/issues', adminController.viewCustomerIssues);
router.get('/issues/:id', adminController.viewIssueDetails);
router.patch('/issues/:id/status', adminController.updateIssueStatus);

// Report and Analytics
router.get('/reports/sales', adminController.viewSalesReport);
router.get('/reports/order-analytics', adminController.viewOrderAnalytics);
router.get('/reports/user-activity', adminController.viewUserActivityReports);
router.get('/reports/performance', adminController.viewPerformanceMetrics);
router.get('/reports/platform-earnings', adminController.viewPlatformEarnings);

// Financial Management
router.get('/transactions', adminController.viewAllTransactions);
router.get('/transactions/:id', adminController.viewTransactionDetails);
router.get('/payouts', adminController.viewAllPayouts);
router.post('/payouts', adminController.initiatePayoutToPartners);

// Pickup Management
router.get('/pickups', adminController.viewAllPickups);
router.get('/pickups/:pickupId', adminController.viewPickupDetails);
router.patch('/pickups/:pickupId/assign', adminController.assignDeliveryBoyToPickup);
router.patch('/pickups/:pickupId/status', adminController.updatePickupStatus);
router.patch('/pickups/:pickupId/cancel', adminController.cancelPickupWithReason);
router.patch('/pickups/:pickupId/amount', adminController.updatePickupAmount);
router.get('/pickups/:pickupId/amount', adminController.getPickupAmount); // View pickup amount

//paymentmethods
router.get('/payment-methods', adminController.getAllPaymentMethods);
router.post('/payment-methods', upload.single('image'), adminController.addPaymentMethod);
router.delete('/payment-methods/:id', adminController.deletePaymentMethod);
router.patch('/payment-methods/:id/activate', adminController.togglePaymentMethodActive);
router.put('/payment-methods/:id', upload.single('image'), adminController.updatePaymentMethod);
// Disable any payment method for a customer (admin)
router.patch('/customers/:customerId/disable-payment-method', adminController.disablePaymentMethodForCustomer);
// Enable any payment method for a customer (admin)
router.patch('/customers/:customerId/enable-payment-method', adminController.enablePaymentMethodForCustomer);


//banners
router.post('/banners', upload.single('image'), adminController.createBanner);

router.delete('/banners/:id', adminController.deleteBanner);
router.get('/banners', adminController.viewAllBanners);
router.get('/banners/:id', adminController.viewBannerDetails);
router.patch('/banners/:id/activate', adminController.toggleBannerActive);

// Popular Dishes Management
router.post('/popular-dishes/add', adminController.addProductToPopularDishes);
router.post('/popular-dishes/remove', adminController.removeProductFromPopularDishes);
router.get('/popular-dishes', adminController.getPopularDishes);
router.get('/popular-dishes/verify', adminController.verifyPopularDish);
router.post('/popular-dishes/reorder', adminController.reorderPopularDishes); // New route for reordering popular dishes


// Popular Restaurants Management
router.post('/popular-restaurants/add', adminController.addRestaurantToPopular);
router.post('/popular-restaurants/remove', adminController.removeRestaurantFromPopular);
router.get('/popular-restaurants', adminController.getPopularRestaurants);
router.get('/popular-restaurants/verify', adminController.verifyPopularRestaurant);

// Delivery Fee
router.post('/delivery-fee', adminController.createDeliveryFee);
router.get('/delivery-fee', adminController.viewAllDeliveryFees);
router.put('/delivery-fee/:id', adminController.updateDeliveryFee);
router.patch('/delivery-fee/:id/activate', adminController.activateDeactivateDeliveryFee);
router.delete('/delivery-fee/:id', adminController.deleteDeliveryFee); // Delete delivery fee

// GST & Taxes
router.post('/gst-taxes', adminController.createGstTax);
router.get('/gst-taxes', adminController.viewAllGstTaxes);
router.put('/gst-taxes/:id', adminController.updateGstTax);
router.patch('/gst-taxes/:id/activate', adminController.activateDeactivateGstTax);
router.delete('/gst-taxes/:id', adminController.deleteGstTax); // Delete GST tax

// Handling Charge
router.post('/handling-charge', adminController.createHandlingCharge);
router.get('/handling-charge', adminController.viewAllHandlingCharges);
router.put('/handling-charge/:id', adminController.updateHandlingCharge);
router.patch('/handling-charge/:id/activate', adminController.activateDeactivateHandlingCharge);
router.delete('/handling-charge/:id', adminController.deleteHandlingCharge); // Delete handling charge

// Section Management
router.post('/sections', upload.single('image'), adminController.createSection);
router.put('/sections/:id', upload.single('image'), adminController.updateSection);
router.delete('/sections/:id', adminController.removeSection);
router.get('/sections', adminController.viewAllSections);
router.post('/sections/reorder', adminController.reorderSections); // <-- Add this line
router.post('/sections/add-product', adminController.addProductToSection);
router.get('/sections/:sectionId/products', adminController.viewAllProductsOfSection);
router.post('/sections/remove-product', adminController.removeProductFromSection);
router.post('/sections/:sectionId/reorder-products', adminController.reorderProductsInSection); // New route for reordering products inside a section

// Profile Wallpaper Management
router.post('/profile-wallpapers', upload.single('image'), adminController.addProfileWallpaper);
router.delete('/profile-wallpapers/:id', adminController.removeProfileWallpaper);
router.get('/profile-wallpapers', adminController.getAllProfileWallpapers);

// Admin Profile
router.get('/profile', verifyToken, (req, res) => {
  try {
    if (!req.user) {
      console.error('Admin profile error: req.user missing');
      return res.status(401).json({ message: 'Unauthorized: user not found in request' });
    }
    // Return the admin user profile
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      status: req.user.status,
      isApproved: req.user.isApproved
    });
  } catch (err) {
    console.error('Error fetching admin profile:', err);
    res.status(500).json({ message: 'Error fetching admin profile', error: err?.message || err });
  }
});

router.patch('/approve-delivery-boy/:id', adminController.approveDeliveryBoy);

// Return Instructions Management
router.post('/return-instructions', adminController.addReturnInstruction);
router.put('/return-instructions/:id', adminController.updateReturnInstruction);
router.get('/return-instructions', adminController.getAllReturnInstructions);
router.get('/return-instructions/:id', adminController.getReturnInstructionById);
router.patch('/return-instructions/:id/activate', adminController.toggleReturnInstructionActive);
router.delete('/return-instructions/:id', adminController.deleteReturnInstruction);

// Notifications Management
router.get('/notifications', verifyToken, adminController.viewAllNotifications); // <-- Add verifyToken

// Minimum Cart Amount Management
router.post('/min-cart-amount/set', adminController.setMinCartAmount);
router.get('/min-cart-amount/view', adminController.viewMinCartAmount);
router.put('/min-cart-amount/update', adminController.updateMinCartAmount);
router.patch('/min-cart-amount/toggle', adminController.toggleMinCartAmountActive);
router.delete('/min-cart-amount', adminController.deleteMinCartAmount);

// Test Route
router.get('/test', (req, res) => res.json({ ok: true }));

// Delivery Fee Section Management
router.get('/delivery-fee-sections', adminController.getAllDeliveryFeeSections);
router.post('/delivery-fee-sections', adminController.createDeliveryFeeSection);
router.put('/delivery-fee-sections/:sectionId', adminController.updateDeliveryFeeSection);
router.delete('/delivery-fee-sections/:sectionId', adminController.deleteDeliveryFeeSection);
// Fee slab management inside a section
router.post('/delivery-fee-sections/:sectionId/fees', adminController.addDeliveryFeeSlab);
router.put('/delivery-fee-sections/:sectionId/fees/:feeId', adminController.updateDeliveryFeeSlab);
router.delete('/delivery-fee-sections/:sectionId/fees/:feeId', adminController.deleteDeliveryFeeSlab);

module.exports = router;