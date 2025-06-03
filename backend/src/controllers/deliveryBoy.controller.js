const User = require('../models/user.model');
const Order = require('../models/order');
const Notification = require('../models/notification.model'); // If you have this model
const bcrypt = require('bcryptjs');
const PickupDrop = require('../models/PickupDrop.model');
// ...existing code...

// ===== Authentication & Onboarding =====
exports.viewApprovalStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ isApproved: user.isApproved });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching approval status', error: err });
  }
};

exports.uploadVerifyingDocuments = async (req, res) => {
  // Assuming file upload handled by middleware, just save file info to user
  try {
    const user = await User.findById(req.user.id);
    user.documents = req.body.documents; // or req.files if using multer
    await user.save();
    res.json({ message: 'Documents uploaded', documents: user.documents });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading documents', error: err });
  }
};

// ===== Profile Management =====
exports.viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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

// ===== Order Management =====
exports.viewAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user.id })
      .populate('customer')
      .populate('restaurant');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assigned orders', error: err });
  }
};

exports.viewOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, deliveryPartner: req.user.id })
      .populate('customer')
      .populate('restaurant');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order details', error: err });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    // Allow all statuses defined in the order model
    const allowedStatuses = [
      'placed', 
      'confirmed', 
      'preparing', 
      'ready', 
      'picked', 
      'on_the_way',
      'delayed',
      'delivered', 
      'cancelled',
      'delayed_high_demand',
      'delayed_weather',
      'delayed_rider_assigned_late',
      'delayed_rider_unavailable',
      'cancelled_by_customer',
      'cancelled_by_admin',
      'cancelled_payment_failed',
      'delivery_failed_wrong_address',
      'delivery_failed_no_response',
      'on_hold',
      'refund_issued',
      // Also allow legacy/label statuses for UI compatibility
      'Reached Vendor',
      'Picked Up',
      'On the Way to Customer',
      'Delivered'
    ];
    const { status, note } = req.body;
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Status can only be one of: ${allowedStatuses.join(', ')}` });
    }
    const order = await Order.findOne({ _id: req.params.id, deliveryPartner: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Map UI-friendly statuses to internal enum if needed
    let mappedStatus = status;
    if (status === 'Reached Vendor') mappedStatus = 'confirmed';
    if (status === 'Picked Up') mappedStatus = 'picked';
    if (status === 'On the Way to Customer') mappedStatus = 'on_the_way';
    if (status === 'Delivered') mappedStatus = 'delivered';

    order.status = mappedStatus;
    if (note) order.statusNote = note;
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order status', error: err });
  }
};

// ===== Financial Management =====
exports.viewEarningReport = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user.id, status: 'Delivered' });
    const totalEarnings = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    res.json({ totalEarnings, orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching earning report', error: err });
  }
};

exports.viewDailyEarnings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const orders = await Order.find({
      deliveryPartner: req.user.id,
      status: 'Delivered',
      deliveredAt: { $gte: today, $lt: tomorrow }
    });
    const dailyEarnings = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    res.json({ dailyEarnings, orders });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching daily earnings', error: err });
  }
};

// ===== Notifications =====
exports.viewNotifications = async (req, res) => {
  try {
    console.log(`Fetching notifications for delivery partner ID: ${req.user.id}`);
    
    // Return all notifications for this delivery partner, newest first
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    console.log(`Found ${notifications.length} notifications for delivery partner ${req.user.id}`);
    console.log('Notification sample:', notifications.slice(0, 2));
    
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications', error: err });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: 'Error marking notification as read', error: err });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking all notifications as read', error: err });
  }
};


// View assigned pickups
exports.viewAssignedPickups = async (req, res) => {
  try {
    const pickups = await PickupDrop.find({ deliveryBoy: req.user.id }).sort({ createdAt: -1 });
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assigned pickups', error: err });
  }
};

// View pickup details
exports.viewPickupDetails = async (req, res) => {
  try {
    // Populate customer name and phone
    const pickup = await PickupDrop.findOne({ _id: req.params.id, deliveryBoy: req.user.id })
      .populate('customer', 'name phone');
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    res.json(pickup);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickup details', error: err });
  }
};

// Update pickup status
exports.updatePickupStatus = async (req, res) => {
  try {
    // Accept all frontend variants and map to backend enum
    const statusMap = {
      'pending': 'Pending',
      'accepted': 'Accepted',
      'reached_pickup_location': 'Reached pickup location',
      'picked': 'Picked Up',
      'picked_up': 'Picked Up',
      'on_the_way': 'On the Way to drop location',
      'on_the_way_to_drop_location': 'On the Way to drop location',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      // Also allow direct enum values
      'Pending': 'Pending',
      'Accepted': 'Accepted',
      'Reached pickup location': 'Reached pickup location',
      'Picked Up': 'Picked Up',
      'On the Way to drop location': 'On the Way to drop location',
      'Delivered': 'Delivered',
      'Cancelled': 'Cancelled'
    };
    let { status, note } = req.body;
    status = statusMap[status] || status;
    const allowedStatuses = [
      'Pending',
      'Accepted',
      'Reached pickup location',
      'Picked Up',
      'On the Way to drop location',
      'Delivered',
      'Cancelled'
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: `Status can only be one of: ${allowedStatuses.join(', ')}` });
    }
    const pickup = await PickupDrop.findOne({ _id: req.params.id, deliveryBoy: req.user.id });
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    pickup.status = status;
    pickup.statusNote = note || '';
    await pickup.save();
    res.json({ message: 'Pickup status updated', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Error updating pickup status', error: err });
  }
};