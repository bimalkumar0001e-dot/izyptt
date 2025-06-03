const User = require('../models/user.model');
const Product = require('../models/product');
const Order = require('../models/order');
const Offer = require('../models/offer.model');
const Banner = require('../models/banner.model');
const PaymentMethod = require('../models/paymentMethod.model');
const DeliveryFee = require('../models/deliveryFee.model');
const GstTax = require('../models/gstTax.model');
const HandlingCharge = require('../models/handlingCharge.model');
const Section = require('../models/section.model');
const PickupDrop = require('../models/PickupDrop.model');
const ProfileWallpaper = require('../models/ProfileWallpaper.model');
const Notification = require('../models/notification.model');
const notificationService = require('../services/notificationService');
const SystemStatus = require('../models/SystemStatus.model');
const ReturnInstructions = require('../models/ReturnInstructions.model');
const MinCartAmount = require('../models/minCartAmount.model');




//offer management
exports.createOffer = async (req, res) => {
  try {
    const offerData = { ...req.body };
    if (req.body.limitedTo !== undefined) offerData.limitedTo = Number(req.body.limitedTo);
    if (req.body.perCustomerLimit !== undefined) offerData.perCustomerLimit = Number(req.body.perCustomerLimit);
    const offer = new Offer(offerData);
    await offer.save();
    res.status(201).json({ message: 'Offer created', offer });
  } catch (err) {
    res.status(500).json({ message: 'Error creating offer', error: err });
  }
};

exports.getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find();
    // Auto-deactivate offers that reached their limit
    for (const offer of offers) {
      if (
        offer.limitedTo !== null &&
        offer.limitedTo !== undefined &&
        offer.usageCount >= offer.limitedTo &&
        offer.isActive
      ) {
        offer.isActive = false;
        await offer.save();
      }
    }
    res.json(await Offer.find());
  } catch (err) {
    res.status(500).json({ message: 'Error fetching offers', error: err });
  }
};

exports.getOfferDetails = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    // Auto-deactivate if usageCount reached limitedTo
    if (
      offer &&
      offer.limitedTo !== null &&
      offer.limitedTo !== undefined &&
      offer.usageCount >= offer.limitedTo &&
      offer.isActive
    ) {
      offer.isActive = false;
      await offer.save();
    }
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching offer', error: err });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.limitedTo !== undefined) updateData.limitedTo = Number(req.body.limitedTo);
    if (req.body.perCustomerLimit !== undefined) updateData.perCustomerLimit = Number(req.body.perCustomerLimit);
    const offer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer updated', offer });
  } catch (err) {
    res.status(500).json({ message: 'Error updating offer', error: err });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting offer', error: err });
  }
};

exports.activateDeactivateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    offer.isActive = !offer.isActive; // <-- fix: use isActive
    await offer.save();
    res.json({ message: `Offer ${offer.isActive ? 'activated' : 'deactivated'}`, offer });
  } catch (err) {
    res.status(500).json({ message: 'Error updating offer status', error: err });
  }
};

// --- Helper: Check if customer can use offer ---
exports.canCustomerUseOffer = async (req, res) => {
  try {
    const { offerId, customerId } = req.query;
    if (!offerId || !customerId) return res.status(400).json({ message: 'offerId and customerId required' });
    const offer = await Offer.findById(offerId);
    if (!offer || !offer.isActive) return res.status(404).json({ message: 'Offer not found or inactive' });
    const usage = offer.customerUsage?.get(customerId) || 0;
    const allowed = usage < (offer.perCustomerLimit || 1);
    res.json({ canUse: allowed, usage, perCustomerLimit: offer.perCustomerLimit });
  } catch (err) {
    res.status(500).json({ message: 'Error checking offer usage', error: err });
  }
};

// --- Call this when customer uses an offer (e.g., in order placement logic) ---
exports.incrementOfferUsageForCustomer = async (offerId, customerId) => {
  const offer = await Offer.findById(offerId);
  if (!offer || !offer.isActive) return false;
  const usage = offer.customerUsage?.get(customerId) || 0;
  if (usage >= (offer.perCustomerLimit || 1)) return false;
  offer.customerUsage.set(customerId, usage + 1);
  offer.usageCount += 1;
  // Optionally, deactivate offer globally if usageCount hits limitedTo
  if (
    offer.limitedTo !== null &&
    offer.limitedTo !== undefined &&
    offer.usageCount >= offer.limitedTo &&
    offer.isActive
  ) {
    offer.isActive = false;
  }
  await offer.save();
  return true;
};




// Dashboard
exports.getDashboardStatistics = async (req, res) => {
  try {
    const customers = await User.countDocuments({ role: 'customer' });
    const restaurants = await User.countDocuments({ role: 'restaurant' });
    const deliveryPartners = await User.countDocuments({ role: 'delivery' });
    const orders = await Order.countDocuments();
    res.json({ customers, restaurants, deliveryPartners, orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err });
  }
};

// --- System Status Management ---
exports.getSystemStatus = async (req, res) => {
  try {
    let statusDoc = await SystemStatus.findOne();
    if (!statusDoc) {
      statusDoc = await SystemStatus.create({ status: 'online' });
    }
    res.json({ status: statusDoc.status, message: statusDoc.message });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching system status', error: err });
  }
};

exports.updateSystemStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    let statusDoc = await SystemStatus.findOne();
    if (!statusDoc) {
      statusDoc = await SystemStatus.create({ status: status || 'online', message: message || '' });
    } else {
      if (status) statusDoc.status = status;
      if (message !== undefined) statusDoc.message = message;
      await statusDoc.save();
    }
    res.json({ message: 'System status updated', status: statusDoc.status, message: statusDoc.message });
  } catch (err) {
    res.status(500).json({ message: 'Error updating system status', error: err });
  }
};






// User Management - Customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers', error: err });
  }
};

exports.activateDeactivateCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'customer') return res.status(404).json({ message: 'Customer not found' });
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.json({ message: `Customer ${user.status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating customer status', error: err });
  }
};

exports.getCustomerOrderHistory = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'customer') return res.status(404).json({ message: 'Customer not found' });
    const orders = await Order.find({ customer: user._id });
    res.json({ user, orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order history', error: err });
  }
};

// Delivery Boy Management
exports.getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await User.find({ role: 'delivery' });
    res.json(deliveryBoys);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching delivery boys', error: err });
  }
};

exports.getDeliveryBoyDetails = async (req, res) => {
  try {
    const deliveryBoy = await User.findById(req.params.id);
    if (!deliveryBoy || deliveryBoy.role !== 'delivery') return res.status(404).json({ message: 'Delivery boy not found' });
    const orders = await Order.find({ deliveryPartner: deliveryBoy._id });
    res.json({ deliveryBoy, orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching delivery boy details', error: err });
  }
};

exports.activateDeactivateDeliveryBoy = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery') return res.status(404).json({ message: 'Delivery boy not found' });
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.json({ message: `Delivery boy ${user.status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating delivery boy status', error: err });
  }
};

exports.getPendingDeliveryPartners = async (req, res) => {
  try {
    const pending = await User.find({ role: 'delivery', isApproved: false });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending delivery partners', error: err });
  }
};

exports.approveDeliveryBoy = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'delivery') return res.status(404).json({ message: 'Delivery boy not found' });
    user.isApproved = true;
    user.status = 'active'; // <-- Add this line
    await user.save();
    res.json({ message: 'Delivery boy approved' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving delivery boy', error: err });
  }
};

// Restaurant Partner Management
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: 'restaurant' });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants', error: err });
  }
};

exports.getRestaurantDetails = async (req, res) => {
  try {
    const restaurant = await User.findById(req.params.id);
    if (!restaurant || restaurant.role !== 'restaurant') return res.status(404).json({ message: 'Restaurant not found' });
    const orders = await Order.find({ restaurant: restaurant._id });
    res.json({ restaurant, orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurant details', error: err });
  }
};

exports.getPendingRestaurants = async (req, res) => {
  try {
    const pending = await User.find({ role: 'restaurant', isApproved: false });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending restaurants', error: err });
  }
};

exports.approveRestaurant = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'restaurant') return res.status(404).json({ message: 'Restaurant not found' });
    user.isApproved = true;
    await user.save();
    res.json({ message: 'Restaurant approved' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving restaurant', error: err });
  }
};

exports.activateDeactivateRestaurant = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'restaurant') return res.status(404).json({ message: 'Restaurant not found' });
    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();
    res.json({ message: `Restaurant ${user.status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error updating restaurant status', error: err });
  }
};

// popular restaurant management
//select popular restaurants
// remove popular restaurants
// view all popular restaurants

// Add a restaurant to popular restaurants (max 4)
exports.addRestaurantToPopular = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ message: 'Restaurant ID required' });

    // Count current popular restaurants
    const popularCount = await User.countDocuments({ role: 'restaurant', isPopular: true });
    if (popularCount >= 4)
      return res.status(400).json({ message: 'Maximum 4 popular restaurants allowed' });

    const restaurant = await User.findById(restaurantId);
    if (!restaurant || restaurant.role !== 'restaurant')
      return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.isPopular = true;
    await restaurant.save();
    res.json({ message: 'Restaurant added to popular', restaurant });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to popular restaurants', error: err });
  }
};

// Remove a restaurant from popular
exports.removeRestaurantFromPopular = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ message: 'Restaurant ID required' });

    const restaurant = await User.findById(restaurantId);
    if (!restaurant || restaurant.role !== 'restaurant')
      return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.isPopular = false;
    await restaurant.save();
    res.json({ message: 'Restaurant removed from popular', restaurant });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from popular restaurants', error: err });
  }
};

// View all popular restaurants
exports.getPopularRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ role: 'restaurant', isPopular: true });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular restaurants', error: err });
  }
};

// Verify if a restaurant is popular
exports.verifyPopularRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ message: 'Restaurant ID required' });

    const restaurant = await User.findById(restaurantId);
    if (!restaurant || restaurant.role !== 'restaurant')
      return res.status(404).json({ message: 'Restaurant not found' });

    res.json({ isPopular: !!restaurant.isPopular });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying popular restaurant', error: err });
  }
};

// ===== Order Management =====
exports.listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('customer restaurant deliveryPartner');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
};

exports.viewOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer restaurant deliveryPartner');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order details', error: err });
  }
};

exports.assignDeliveryPartner = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.deliveryPartner = req.body.deliveryPartnerId;
    await order.save();

    // Create notification for delivery partner
    if (order.deliveryPartner) {
      const notification = await Notification.create({
        user: order.deliveryPartner,
        message: `You have been assigned a new delivery order (Order ID: ${order._id})`,
        type: 'delivery', // IMPORTANT: Changed from 'order' to 'delivery'
        orderId: order._id // IMPORTANT: Added orderId field
      });
      
      console.log('Created delivery notification:', JSON.stringify(notification));

      // Send real-time notification with orderId for frontend navigation
      notificationService.sendRealTimeNotification(
        `user:${order.deliveryPartner}`,
        {
          type: 'delivery',
          title: 'New Delivery Assignment',
          message: notification.message,
          orderId: order._id,
          notification
        }
      );
    }

    res.json({ message: 'Delivery partner assigned', order });
  } catch (err) {
    console.error('Error assigning delivery partner:', err);
    res.status(500).json({ message: 'Error assigning delivery partner', error: err });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update order status.' });
    }
    // Allow admin to set any status
    const newStatus = req.body.status;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = newStatus;
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err });
  }
};

exports.cancelOrderWithReason = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = 'cancelled'; // Use lowercase as per your schema enum
    order.cancellationReason = req.body.reason || 'Cancelled by admin';
    order.cancellationTime = new Date();
    order.cancelledBy = {
      userId: req.user ? req.user._id : null,
      role: req.user ? req.user.role : 'admin'
    };
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order', error: err });
  }
};

// ===== Product Management =====
exports.createProduct = async (req, res) => {
  try {
    // Reject if multiple files are uploaded
    if (Array.isArray(req.files) && req.files.length > 1) {
      return res.status(400).json({ message: 'Only one image file is allowed.' });
    }

    const { name, price, description, category, stock, restaurant, returnPolicy } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    // Only require name, price, description, category, stock, image, returnPolicy
    if (!name || !price || !description || !category || !stock || !image || !returnPolicy) {
      return res.status(400).json({ message: 'All fields except Restaurant ID are required. Return policy is mandatory.' });
    }
    // Fix the isAvailable conversion
    const isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;

    const product = new Product({
      name,
      price,
      description,
      category,
      image,
      stock,
      returnPolicy,
      isAvailable
    });
    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err });
  }
};

exports.viewAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
};

exports.viewProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product details', error: err });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Use strict undefined check for updates
    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.category !== undefined) product.category = req.body.category;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    // Only update restaurant if provided and not empty
    if (req.body.restaurant !== undefined) {
      if (req.body.restaurant === '' || req.body.restaurant === null) {
        product.restaurant = undefined;
      } else {
        product.restaurant = req.body.restaurant;
      }
    }
    if (req.body.isAvailable !== undefined) product.isAvailable = req.body.isAvailable === 'true' || req.body.isAvailable === true;
    if (req.body.returnPolicy !== undefined) product.returnPolicy = req.body.returnPolicy;
    if (req.file) product.image = `/uploads/${req.file.filename}`;

    await product.save();
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err });
  }
};

exports.changeProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.available = req.body.available;
    await product.save();
    res.json({ message: 'Product availability updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Error updating availability', error: err });
  }
};

// ===== Popular Dishes Management =====

// Add a product to popular dishes (max 4)
exports.addProductToPopularDishes = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    // Count current popular dishes
    const popularCount = await Product.countDocuments({ isPopular: true });
    if (popularCount >= 4)
      return res.status(400).json({ message: 'Maximum 4 popular dishes allowed' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isPopular = true;
    await product.save();
    res.json({ message: 'Product added to popular dishes', product });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to popular dishes', error: err });
  }
};

// Remove a product from popular dishes
exports.removeProductFromPopularDishes = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isPopular = false;
    await product.save();
    res.json({ message: 'Product removed from popular dishes', product });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from popular dishes', error: err });
  }
};

// Get all popular dishes
exports.getPopularDishes = async (req, res) => {
  try {
    const products = await Product.find({ isPopular: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular dishes', error: err });
  }
};

// Verify if a product is popular
exports.verifyPopularDish = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ isPopular: !!product.isPopular });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying popular dish', error: err });
  }
};

// ===== Customer Support =====
const Issue = require('../models/issue.model'); // If you have an Issue model

exports.viewCustomerIssues = async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issues', error: err });
  }
};

exports.viewIssueDetails = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issue details', error: err });
  }
};

exports.updateIssueStatus = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    issue.status = req.body.status;
    await issue.save();
    res.json({ message: 'Issue status updated', issue });
  } catch (err) {
    res.status(500).json({ message: 'Error updating issue status', error: err });
  }
};

// ===== Report and Analytics =====
exports.viewSalesReport = async (req, res) => {
  try {
    // Example: total sales amount
    const sales = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({ totalSales: sales[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales report', error: err });
  }
};

exports.viewOrderAnalytics = async (req, res) => {
  try {
    // Example: orders per day
    const analytics = await Order.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order analytics', error: err });
  }
};

exports.viewUserActivityReports = async (req, res) => {
  // Implement as per your activity tracking logic
  res.json({ message: 'User activity report endpoint' });
};

exports.viewPerformanceMetrics = async (req, res) => {
  // Implement as per your metrics logic
  res.json({ message: 'Performance metrics endpoint' });
};

exports.viewPlatformEarnings = async (req, res) => {
  try {
    const earnings = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);
    res.json({ totalEarnings: earnings[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching platform earnings', error: err });
  }
};

// ===== Financial Management =====
const Transaction = require('../models/transaction.model'); // If you have a Transaction model
const Payout = require('../models/payout.model'); // If you have a Payout model

exports.viewAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err });
  }
};

exports.viewTransactionDetails = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transaction details', error: err });
  }
};

exports.viewAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find();
    res.json(payouts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payouts', error: err });
  }
};

exports.initiatePayoutToPartners = async (req, res) => {
  try {
    // Example: create a payout record
    const payout = new Payout(req.body);
    await payout.save();
    res.status(201).json({ message: 'Payout initiated', payout });
  } catch (err) {
    res.status(500).json({ message: 'Error initiating payout', error: err });
  }
};

// View all pickups
exports.viewAllPickups = async (req, res) => {
  try {
    const pickups = await PickupDrop.find()
      .populate('customer')
      .populate('deliveryBoy'); // <-- Add this line
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickups', error: err });
  }
};

// Assign delivery boy to pickup
exports.assignDeliveryBoyToPickup = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const { deliveryBoyId } = req.body;
    const pickup = await PickupDrop.findById(pickupId);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    pickup.deliveryBoy = deliveryBoyId;
    // Do NOT change status here, keep as "Pending"
    await pickup.save();
    // Populate deliveryBoy for the response
    const populatedPickup = await PickupDrop.findById(pickupId)
      .populate('customer')
      .populate('deliveryBoy');
    res.json({ message: 'Delivery boy assigned to pickup', pickup: populatedPickup });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning delivery boy', error: err });
  }
};

// View pickup details
exports.viewPickupDetails = async (req, res) => {
  try {
    const pickup = await PickupDrop.findById(req.params.pickupId)
      .populate('customer')
      .populate('deliveryBoy'); // <-- Add this line
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    res.json(pickup);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickup details', error: err });
  }
};

// Update pickup status
exports.updatePickupStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Accept any status string (remove strict allowedStatuses check)
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: 'Status is required and must be a string.' });
    }
    const pickup = await PickupDrop.findById(req.params.pickupId);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    pickup.status = status;
    await pickup.save();
    res.json({ message: 'Pickup status updated', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Error updating pickup status', error: err });
  }
};

// Cancel pickup with reason
exports.cancelPickupWithReason = async (req, res) => {
  try {
    const { reason } = req.body;
    const pickup = await PickupDrop.findById(req.params.pickupId);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    pickup.status = 'Cancelled';
    pickup.cancelReason = reason;
    await pickup.save();
    res.json({ message: 'Pickup cancelled', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling pickup', error: err });
  }
};

// Update pickup amount
exports.updatePickupAmount = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const { totalAmount } = req.body;
    if (typeof totalAmount !== 'number' || isNaN(totalAmount) || totalAmount < 0) {
      return res.status(400).json({ message: 'totalAmount must be a non-negative number' });
    }
    const pickup = await PickupDrop.findById(pickupId);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    pickup.totalAmount = totalAmount;
    await pickup.save();
    res.json({ message: 'Pickup amount updated', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Error updating pickup amount', error: err });
  }
};

// View pickup amount (single pickup)
exports.getPickupAmount = async (req, res) => {
  try {
    const { pickupId } = req.params;
    const pickup = await PickupDrop.findById(pickupId);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    res.json({ pickupId, totalAmount: pickup.totalAmount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickup amount', error: err });
  }
};

// View all notifications for admin
exports.viewAllNotifications = async (req, res) => {
  try {
    // If you want to fetch notifications for the logged-in admin only:
    // Make sure the route uses verifyToken middleware!
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Fetch notifications for this admin
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err });
  }
};


// Payment Methods Management
exports.getAllPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find();
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payment methods', error: err });
  }
};


// Add new payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const { name, details, description, paymentGuide, instructions } = req.body;
    if (!name || !details) {
      return res.status(400).json({ message: 'Name and details are required' });
    }
    const paymentMethodData = {
      name,
      details,
      description,
      paymentGuide,
      instructions
    };
    if (req.file) {
      paymentMethodData.image = `/uploads/${req.file.filename}`;
    }
    const method = new PaymentMethod(paymentMethodData);
    await method.save();
    res.status(201).json({ message: 'Payment method added', method });
  } catch (err) {
    res.status(500).json({ message: 'Error adding payment method', error: err });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    await PaymentMethod.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment method deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting payment method', error: err });
  }
};

// Activate/Deactivate payment method
exports.togglePaymentMethodActive = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: 'Payment method not found' });
    method.active = !method.active;
    await method.save();
    res.json({ message: `Payment method ${method.active ? 'activated' : 'deactivated'}`, method });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment method status', error: err });
  }
};

// Update payment method (accepts form-data, including optional image)
exports.updatePaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id);
    if (!method) return res.status(404).json({ message: 'Payment method not found' });

    if (req.body.name !== undefined) method.name = req.body.name;
    if (req.body.details !== undefined) method.details = req.body.details;
    if (req.body.description !== undefined) method.description = req.body.description;
    if (req.body.paymentGuide !== undefined) method.paymentGuide = req.body.paymentGuide;
    if (req.body.instructions !== undefined) method.instructions = req.body.instructions;
    if (req.file) method.image = `/uploads/${req.file.filename}`;

    await method.save();
    res.json({ message: 'Payment method updated', method });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment method', error: err });
  }
};

// Disable any payment method for a customer (by method name or ID)
exports.disablePaymentMethodForCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.customerId);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Accept either payment method name or ID
    const { paymentMethod } = req.body;
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method name or ID is required' });
    }

    // Try to resolve payment method name if ID is given
    let methodName = paymentMethod;
    if (paymentMethod.match(/^[0-9a-fA-F]{24}$/)) {
      const method = await PaymentMethod.findById(paymentMethod);
      if (!method) return res.status(404).json({ message: 'Payment method not found' });
      methodName = method.name;
    }

    if (!user.disabledPaymentMethods) user.disabledPaymentMethods = [];
    if (!user.disabledPaymentMethods.includes(methodName)) {
      user.disabledPaymentMethods.push(methodName);
      await user.save();
    }

    res.json({ message: `Payment method '${methodName}' disabled for this customer`, user });
  } catch (err) {
    res.status(500).json({ message: 'Error disabling payment method for customer', error: err });
  }
};

//Enable any payment method for a customer (by method name or ID)
exports.enablePaymentMethodForCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.params.customerId);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Accept either payment method name or ID
    const { paymentMethod } = req.body;
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method name or ID is required' });
    }

    // Try to resolve payment method name if ID is given
    let methodName = paymentMethod;
    if (paymentMethod.match(/^[0-9a-fA-F]{24}$/)) {
      const method = await PaymentMethod.findById(paymentMethod);
      if (!method) return res.status(404).json({ message: 'Payment method not found' });
      methodName = method.name;
    }

    if (!user.disabledPaymentMethods) user.disabledPaymentMethods = [];
    // Remove the methodName from disabledPaymentMethods if present
    const index = user.disabledPaymentMethods.indexOf(methodName);
    if (index !== -1) {
      user.disabledPaymentMethods.splice(index, 1);
      await user.save();
    }

    res.json({ message: `Payment method '${methodName}' enabled for this customer`, user });
  } catch (err) {
    res.status(500).json({ message: 'Error enabling payment method for customer', error: err });
  }
};

//Banner Management
// Create Banner
exports.createBanner = async (req, res) => {
  try {
    const bannerData = req.body;
    
    // Handle file upload if exists
    if (req.file) {
      // Store image path - adjust the path as needed for your front-end access
      bannerData.image = `/uploads/${req.file.filename}`;
    } else if (!bannerData.image) {
      return res.status(400).json({ message: 'Banner image is required' });
    }
    
    const banner = new Banner(bannerData);
    await banner.save();
    res.status(201).json({ message: 'Banner created', banner });
  } catch (err) {
    res.status(500).json({ message: 'Error creating banner', error: err });
  }
};

// Delete Banner
exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting banner', error: err });
  }
};

// View all banners
exports.viewAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banners', error: err });
  }
};

// View single banner details
exports.viewBannerDetails = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching banner details', error: err });
  }
};

// Activate/Deactivate Banner
exports.toggleBannerActive = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}`, banner });
  } catch (err) {
    res.status(500).json({ message: 'Error updating banner status', error: err });
  }
};





//delivery fee Management

exports.createDeliveryFee = async (req, res) => {
  try {
    const fee = new DeliveryFee(req.body);
    await fee.save();
    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ message: 'Error creating delivery fee', error: err });
  }
};

exports.viewAllDeliveryFees = async (req, res) => {
  try {
    // Return ALL delivery fees, not just active ones
    const allFees = await DeliveryFee.find();
    
    // Only return placeholder if there are no fees at all
    if (allFees.length === 0) {
      // No fees found, return a default placeholder
      res.json([{ amount: 0, isActive: false }]);
    } else {
      // Return all fees, both active and inactive
      res.json(allFees);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching delivery fees', error: err });
  }
};

exports.updateDeliveryFee = async (req, res) => {
  try {
    const fee = await DeliveryFee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fee) return res.status(404).json({ message: 'Delivery fee not found' });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: 'Error updating delivery fee', error: err });
  }
};

exports.activateDeactivateDeliveryFee = async (req, res) => {
  try {
    const fee = await DeliveryFee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Delivery fee not found' });
    fee.isActive = !fee.isActive;
    await fee.save();
    res.json({ message: `Delivery fee ${fee.isActive ? 'activated' : 'deactivated'}`, fee });
  } catch (err) {
    res.status(500).json({ message: 'Error updating delivery fee status', error: err });
  }
};

// Delete Delivery Fee
exports.deleteDeliveryFee = async (req, res) => {
  try {
    await DeliveryFee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Delivery fee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting delivery fee', error: err });
  }
};

// taxes and charges Management

exports.createGstTax = async (req, res) => {
  try {
    const gst = new GstTax(req.body);
    await gst.save();
    res.status(201).json(gst);
  } catch (err) {
    res.status(500).json({ message: 'Error creating GST/Tax', error: err });
  }
};

exports.viewAllGstTaxes = async (req, res) => {
  try {
    // Return ALL GST taxes, not just active ones
    const allTaxes = await GstTax.find();
    
    // Only return placeholder if there are no taxes at all
    if (allTaxes.length === 0) {
      // No taxes found, return a default placeholder
      res.json([{ percentage: 0, isActive: false }]);
    } else {
      // Return all taxes, both active and inactive
      res.json(allTaxes);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching GST/Taxes', error: err });
  }
};

exports.updateGstTax = async (req, res) => {
  try {
    const gst = await GstTax.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gst) return res.status(404).json({ message: 'GST/Tax not found' });
    res.json(gst);
  } catch (err) {
    res.status(500).json({ message: 'Error updating GST/Tax', error: err });
  }
};

exports.activateDeactivateGstTax = async (req, res) => {
  try {
    const gst = await GstTax.findById(req.params.id);
    if (!gst) return res.status(404).json({ message: 'GST/Tax not found' });
    gst.isActive = !gst.isActive;
    await gst.save();
    res.json({ message: `GST/Tax ${gst.isActive ? 'activated' : 'deactivated'}`, gst });
  } catch (err) {
    res.status(500).json({ message: 'Error updating GST/Tax status', error: err });
  }
};

// Delete GST Tax
exports.deleteGstTax = async (req, res) => {
  try {
    await GstTax.findByIdAndDelete(req.params.id);
    res.json({ message: 'GST/Tax deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting GST/Tax', error: err });
  }
};

// Handling Charges Management

// Handling Charges
exports.createHandlingCharge = async (req, res) => {
  try {
    const charge = new HandlingCharge(req.body);
    await charge.save();
    res.status(201).json(charge);
  } catch (err) {
    res.status(500).json({ message: 'Error creating handling charge', error: err });
  }
};

exports.viewAllHandlingCharges = async (req, res) => {
  try {
    // Return ALL handling charges, not just active ones
    const allCharges = await HandlingCharge.find();
    
    // Only return placeholder if there are no charges at all
    if (allCharges.length === 0) {
      // No charges found, return a default placeholder
      res.json([{ amount: 0, isActive: false }]);
    } else {
      // Return all charges, both active and inactive
      res.json(allCharges);
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching handling charges', error: err });
  }
};

exports.updateHandlingCharge = async (req, res) => {
  try {
    const charge = await HandlingCharge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!charge) return res.status(404).json({ message: 'Handling charge not found' });
    res.json(charge);
  } catch (err) {
    res.status(500).json({ message: 'Error updating handling charge', error: err });
  }
};

exports.activateDeactivateHandlingCharge = async (req, res) => {
  try {
    const charge = await HandlingCharge.findById(req.params.id);
    if (!charge) return res.status(404).json({ message: 'Handling charge not found' });
    charge.isActive = !charge.isActive;
    await charge.save();
    res.json({ message: `Handling charge ${charge.isActive ? 'activated' : 'deactivated'}`, charge });
  } catch (err) {
    res.status(500).json({ message: 'Error updating handling charge status', error: err });
  }
};

// Delete Handling Charge
exports.deleteHandlingCharge = async (req, res) => {
  try {
    await HandlingCharge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Handling charge deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting handling charge', error: err });
  }
};


exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await User.findById(req.params.id);
    if (!restaurant || restaurant.role !== 'restaurant') {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Update root fields
    if (req.body.name) restaurant.name = req.body.name;
    if (req.body.email) restaurant.email = req.body.email;
    if (req.body.phone) restaurant.phone = req.body.phone;

    // Update nested restaurantDetails fields if provided
    if (req.body.restaurantDetails) {
      for (const key in req.body.restaurantDetails) {
        restaurant.restaurantDetails[key] = req.body.restaurantDetails[key];
      }
    }
    // Optionally, update restaurantDetails.name if sent as a flat field
    if (req.body.restaurantDetailsName) {
      restaurant.restaurantDetails.name = req.body.restaurantDetailsName;
    }

    await restaurant.save();
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: 'Error updating restaurant', error: err });
  }
};







// ===== Section Management =====
// Create new section
exports.createSection = async (req, res) => {
  try {
    // Accept form-data: name, description, image (file)
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'Section name and description are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Section image is required' });
    }
    const exists = await Section.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Section already exists' });

    const image = `/uploads/${req.file.filename}`;
    const section = new Section({ name, description, image });
    await section.save();
    res.status(201).json({ message: 'Section created', section });
  } catch (err) {
    res.status(500).json({ message: 'Error creating section', error: err });
  }
};

// Remove section
exports.removeSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByIdAndDelete(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json({ message: 'Section removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing section', error: err });
  }
};

// View all sections
exports.viewAllSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('products');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sections', error: err });
  }
};

// Add product to section
exports.addProductToSection = async (req, res) => {
  try {
    const { sectionId, productId } = req.body;
    if (!sectionId || !productId) return res.status(400).json({ message: 'Section ID and Product ID are required' });
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    if (section.products.includes(productId)) return res.status(400).json({ message: 'Product already in section' });
    section.products.push(productId);
    await section.save();
    res.json({ message: 'Product added to section', section });
  } catch (err) {
    res.status(500).json({ message: 'Error adding product to section', error: err });
  }
};


// View all products of a section
exports.viewAllProductsOfSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    if (!sectionId) return res.status(400).json({ message: 'Section ID is required' });
    const section = await Section.findById(sectionId).populate('products');
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json({ products: section.products });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products of section', error: err });
  }
};

// Remove product from section
exports.removeProductFromSection = async (req, res) => {
  try {
    const { sectionId, productId } = req.body;
    if (!sectionId || !productId) return res.status(400).json({ message: 'Section ID and Product ID are required' });
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    section.products = section.products.filter(pid => pid.toString() !== productId);
    await section.save();
    res.json({ message: 'Product removed from section', section });
  } catch (err) {
    res.status(500).json({ message: 'Error removing product from section', error: err });
  }
};

// Public: Get all sections with products (for home page)
exports.viewAllSectionsPublic = async (req, res) => {
  try {
    const sections = await Section.find().populate('products');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sections', error: err });
  }
};

// Search sections by name
exports.searchSectionsByName = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const regex = new RegExp(q, 'i');
    const Section = require('../models/section.model');
    const sections = await Section.find({ name: regex }).populate('products');
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: 'Error searching sections', error: err });
  }
};

// Update section (name, description, image)
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    if (req.body.name !== undefined) section.name = req.body.name;
    if (req.body.description !== undefined) section.description = req.body.description;
    if (req.file) section.image = `/uploads/${req.file.filename}`;
    await section.save();
    res.json({ message: 'Section updated', section });
  } catch (err) {
    res.status(500).json({ message: 'Error updating section', error: err });
  }
};

// ===== Customer Pickup History =====

// Add this function:
exports.getCustomerPickupHistory = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'customer') return res.status(404).json({ message: 'Customer not found' });
    const pickups = await PickupDrop.find({ customer: user._id });
    res.json({ user, pickups });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickup history', error: err });
  }
};

// ===== Profile Wallpaper Management =====

// Add new profile wallpaper
exports.addProfileWallpaper = async (req, res) => {
  try {
    // Check if a wallpaper already exists
    const count = await ProfileWallpaper.countDocuments();
    if (count > 0) {
      return res.status(400).json({ message: 'Only one wallpaper allowed. Please remove the existing wallpaper before adding a new one.' });
    }
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Wallpaper name is required' });
    if (!req.file) return res.status(400).json({ message: 'Wallpaper image is required' });

    const image = `/uploads/${req.file.filename}`;
    const wallpaper = new ProfileWallpaper({ name, image });
    await wallpaper.save();
    res.status(201).json({ message: 'Wallpaper added', wallpaper });
  } catch (err) {
    res.status(500).json({ message: 'Error adding wallpaper', error: err });
  }
};

// Remove profile wallpaper by ID
exports.removeProfileWallpaper = async (req, res) => {
  try {
    const { id } = req.params;
    const wallpaper = await ProfileWallpaper.findByIdAndDelete(id);
    if (!wallpaper) return res.status(404).json({ message: 'Wallpaper not found' });
    res.json({ message: 'Wallpaper removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing wallpaper', error: err });
  }
};

// (Optional) View all wallpapers
exports.getAllProfileWallpapers = async (req, res) => {
  try {
    const wallpapers = await ProfileWallpaper.find();
    res.json(wallpapers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wallpapers', error: err });
  }
};

// ===== Return Instructions Management =====

// Add new return instruction
exports.addReturnInstruction = async (req, res) => {
  try {
    const { title, content, isActive } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const instruction = new ReturnInstructions({ title, content, isActive });
    await instruction.save();
    res.status(201).json({ message: 'Return instruction added', instruction });
  } catch (err) {
    res.status(500).json({ message: 'Error adding return instruction', error: err });
  }
};

// Update return instruction
exports.updateReturnInstruction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isActive } = req.body;
    const instruction = await ReturnInstructions.findById(id);
    if (!instruction) {
      return res.status(404).json({ message: 'Return instruction not found' });
    }
    if (title !== undefined) instruction.title = title;
    if (content !== undefined) instruction.content = content;
    if (isActive !== undefined) instruction.isActive = isActive;
    await instruction.save();
    res.json({ message: 'Return instruction updated', instruction });
  } catch (err) {
    res.status(500).json({ message: 'Error updating return instruction', error: err });
  }
};

// View all return instructions
exports.getAllReturnInstructions = async (req, res) => {
  try {
    const instructions = await ReturnInstructions.find();
    res.json(instructions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching return instructions', error: err });
  }
};

// View single return instruction by ID
exports.getReturnInstructionById = async (req, res) => {
  try {
    const { id } = req.params;
    const instruction = await ReturnInstructions.findById(id);
    if (!instruction) {
      return res.status(404).json({ message: 'Return instruction not found' });
    }
    res.json(instruction);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching return instruction', error: err });
  }
};

// Activate/Deactivate return instruction
exports.toggleReturnInstructionActive = async (req, res) => {
  try {
    const { id } = req.params;
    const instruction = await ReturnInstructions.findById(id);
    if (!instruction) {
      return res.status(404).json({ message: 'Return instruction not found' });
    }
    instruction.isActive = !instruction.isActive;
    await instruction.save();
    res.json({ message: `Return instruction ${instruction.isActive ? 'activated' : 'deactivated'}`, instruction });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling return instruction active status', error: err });
  }
};

// Delete return instruction
exports.deleteReturnInstruction = async (req, res) => {
  try {
    const { id } = req.params;
    const instruction = await ReturnInstructions.findByIdAndDelete(id);
    if (!instruction) {
      return res.status(404).json({ message: 'Return instruction not found' });
    }
    res.json({ message: 'Return instruction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting return instruction', error: err });
  }
};

// Set minimum cart amount (create if not exists)
exports.setMinCartAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }
    let minCart = await MinCartAmount.findOne();
    if (minCart) {
      return res.status(400).json({ message: 'Minimum cart amount already set. Use update endpoint.' });
    }
    minCart = new MinCartAmount({
      amount,
      updatedBy: req.user ? req.user._id : null
    });
    await minCart.save();
    res.status(201).json({ message: 'Minimum cart amount set', minCart });
  } catch (err) {
    res.status(500).json({ message: 'Error setting minimum cart amount', error: err });
  }
};

// View minimum cart amount
exports.viewMinCartAmount = async (req, res) => {
  try {
    const minCart = await MinCartAmount.findOne();
    res.json({ amount: minCart ? minCart.amount : 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching minimum cart amount', error: err });
  }
};

// Update minimum cart amount
exports.updateMinCartAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ message: 'Amount must be a non-negative number' });
    }
    let minCart = await MinCartAmount.findOne();
    if (!minCart) {
      minCart = new MinCartAmount({
        amount,
        updatedBy: req.user ? req.user._id : null
      });
    } else {
      minCart.amount = amount;
      minCart.updatedBy = req.user ? req.user._id : null;
      minCart.updatedAt = new Date();
    }
    await minCart.save();
    res.json({ message: 'Minimum cart amount updated', minCart });
  } catch (err) {
    res.status(500).json({ message: 'Error updating minimum cart amount', error: err });
  }
};

// Toggle activate/deactivate minimum cart amount
exports.toggleMinCartAmountActive = async (req, res) => {
  try {
    let minCart = await MinCartAmount.findOne();
    if (!minCart) {
      return res.status(404).json({ message: 'Minimum cart amount not set' });
    }
    minCart.isActive = !minCart.isActive;
    minCart.updatedBy = req.user ? req.user._id : null;
    minCart.updatedAt = new Date();
    await minCart.save();
    res.json({ message: `Minimum cart amount ${minCart.isActive ? 'activated' : 'deactivated'}`, minCart });
  } catch (err) {
    res.status(500).json({ message: 'Error toggling minimum cart amount', error: err });
  }
};

// Delete minimum cart amount
exports.deleteMinCartAmount = async (req, res) => {
  try {
    const minCart = await MinCartAmount.findOne();
    if (!minCart) {
      return res.status(404).json({ message: 'Minimum cart amount not set' });
    }
    await MinCartAmount.deleteOne({ _id: minCart._id });
    res.json({ message: 'Minimum cart amount deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting minimum cart amount', error: err });
  }
};