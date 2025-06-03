const User = require('../models/user.model');
const Product = require('../models/product');
const Order = require('../models/order');
const Notification = require('../models/notification.model');// If you have this model
const bcrypt = require('bcryptjs');

// ===== Authentication & Onboarding =====
exports.checkVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ isApproved: user.isApproved });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching verification status', error: err });
  }
};

// exports.uploadVerificationDocuments = async (req, res) => {
//   // Assuming file upload handled by middleware, just save file info to user
//   try {
//     const user = await User.findById(req.user._id);
//     user.documents = req.body.documents; // or req.files if using multer
//     await user.save();
//     res.json({ message: 'Documents uploaded', documents: user.documents });
//   } catch (err) {
//     res.status(500).json({ message: 'Error uploading documents', error: err });
//   }
// };

// ===== Profile Management =====
exports.viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error changing password', error: err });
  }
};

// exports.updateBusinessHours = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     user.businessHours = req.body.businessHours;
//     await user.save();
//     res.json({ message: 'Business hours updated', businessHours: user.businessHours });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating business hours', error: err });
//   }
// };

// exports.updateRestaurantAvailabilityStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     user.isAvailable = req.body.isAvailable;
//     await user.save();
//     res.json({ message: 'Availability status updated', isAvailable: user.isAvailable });
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating availability', error: err });
//   }
// };

// ===== Menu Management =====
exports.viewAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ restaurant: req.user._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
};

// ===== Order Management =====
exports.viewAllOrders = async (req, res) => {
  try {
    console.log('viewAllOrders - User ID:', req.user._id);
    console.log('viewAllOrders - User Role:', req.user.role);
    
    // Verify this is actually a restaurant user
    if (req.user.role !== 'restaurant') {
      return res.status(403).json({ message: 'Access denied: Not a restaurant account' });
    }
    
    // Make sure to cast _id to string for comparison if needed
    const restaurantId = req.user._id;
    console.log('Finding orders for restaurant ID:', restaurantId);
    
    const orders = await Order.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 }) // Most recent first
      .populate('customer', 'name phone'); // Get customer details
      
    console.log(`Found ${orders.length} orders for restaurant`);
    
    res.json(orders);
  } catch (err) {
    console.error('Error in viewAllOrders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

exports.viewOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, restaurant: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order details:', err); // Add logging
    res.status(500).json({ message: 'Error fetching order details', error: err });
  }
};


// View all delivered orders
exports.viewAllDeliveredOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      restaurant: req.user._id, 
      status: 'delivered' // lowercase
    }).populate('customer', 'name phone').populate('rating');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching delivered orders:', err); // Add logging
    res.status(500).json({ message: 'Error fetching delivered orders', error: err });
  }
};

// View all cancelled orders
exports.viewAllCancelledOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      restaurant: req.user._id, 
      status: 'cancelled' // lowercase
    }).populate('customer', 'name phone');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching cancelled orders:', err); // Add logging
    res.status(500).json({ message: 'Error fetching cancelled orders', error: err });
  }
};

// View single delivered order details with ratings
exports.viewSingleDeliveredOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      restaurant: req.user._id, 
      status: 'delivered' // lowercase
    })
    .populate('customer', 'name phone')
    .populate('rating'); // Assuming you have a 'rating' field referencing a Rating model

    if (!order) return res.status(404).json({ message: 'Delivered order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching delivered order details:', err); // Add logging
    res.status(500).json({ message: 'Error fetching delivered order details', error: err });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, restaurant: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Allow any status update (preparing, packing, etc.)
    if (order.status !== req.body.status && req.body.status === 'delivered') {
      order.deliveredAt = new Date();
    }
    order.status = req.body.status;
    order.statusNote = req.body.note || '';
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    console.error('Error updating order status:', err); // Add logging
    res.status(500).json({ message: 'Error updating order status', error: err });
  }
};

// ===== Financial Management =====
// exports.viewEarningReports = async (req, res) => {
//   try {
//     const orders = await Order.find({ restaurant: req.user._id, status: 'delivered' }); // lowercase
//     const totalEarnings = orders.reduce((sum, o) => sum + (o.restaurantEarning || 0), 0);
//     res.json({ totalEarnings, orders });
//   } catch (err) {
//     console.error('Error fetching earning reports:', err); // Add logging
//     res.status(500).json({ message: 'Error fetching earning reports', error: err });
//   }
// };

exports.viewDailyEarnings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find delivered orders for today
    const orders = await Order.find({
      restaurant: req.user._id,
      status: 'delivered',
      updatedAt: { $gte: today, $lt: tomorrow }
    });

    // Sum finalAmount for all delivered orders
    const dailyEarnings = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

    res.json({ dailyEarnings, orders });
  } catch (err) {
    console.error('Error fetching daily earnings:', err);
    res.status(500).json({ message: 'Error fetching daily earnings', error: err });
  }
};

// Monthly earnings: sum daily earnings for last 30 days
exports.viewMonthlyEarnings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 29);
    // Find delivered orders in last 30 days
    const orders = await Order.find({
      restaurant: req.user._id,
      status: 'delivered',
      deliveredAt: { $gte: monthAgo, $lt: new Date(today.getTime() + 24*60*60*1000) }
    }).sort({ deliveredAt: 1 });

    // Group orders by day with order details
    const dailyMap = {};
    orders.forEach(order => {
      const dateKey = order.deliveredAt ? new Date(order.deliveredAt).toISOString().slice(0, 10) : new Date(order.updatedAt).toISOString().slice(0, 10);
      if (!dailyMap[dateKey]) dailyMap[dateKey] = { date: dateKey, earnings: 0, orders: [] };
      dailyMap[dateKey].earnings += order.finalAmount || order.totalAmount || 0;
      dailyMap[dateKey].orders.push({
        _id: order._id,
        orderNumber: order.orderNumber || order._id,
        deliveredAt: order.deliveredAt,
        finalAmount: order.finalAmount,
        totalAmount: order.totalAmount
      });
    });

    // Prepare daily earnings array with orders for last 30 days
    const dailyEarnings = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(monthAgo);
      d.setDate(monthAgo.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      if (dailyMap[dateKey]) {
        dailyEarnings.push(dailyMap[dateKey]);
      } else {
        dailyEarnings.push({ date: dateKey, earnings: 0, orders: [] });
      }
    }

    // Sum for monthly
    const monthlyEarnings = dailyEarnings.reduce((sum, d) => sum + d.earnings, 0);

    res.json({ monthlyEarnings, dailyEarnings });
  } catch (err) {
    console.error('Error fetching monthly earnings:', err);
    res.status(500).json({ message: 'Error fetching monthly earnings', error: err });
  }
};

// ===== Notifications =====
exports.viewAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notifications', error: err });
  }
};



