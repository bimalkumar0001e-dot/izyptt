const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const logger = require('../utils/logger');

let io;

// Initialize Socket.IO
exports.initialize = (server) => {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
      
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user._id}, Role: ${socket.user.role}`);
    
    // Join role-specific room
    socket.join(`role:${socket.user.role}`);
    
    // Join user-specific room
    socket.join(`user:${socket.user._id}`);
    
    // Join restaurant room if applicable
    if (socket.user.role === 'restaurant') {
      socket.join(`restaurant:${socket.user._id}`);
    }
    
    // Join delivery room if applicable
    if (socket.user.role === 'delivery') {
      socket.join(`delivery:${socket.user._id}`);
    }
    
    // Handle order events
    handleOrderEvents(socket);
    
    // Handle location events
    handleLocationEvents(socket);
    
    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user._id}`);
    });
  });
  
  return io;
};

// Get Socket.IO instance
exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Handle order events
function handleOrderEvents(socket) {
  // Order status update
  socket.on('order:status_update', async (data) => {
    try {
      const { orderId, status, note } = data;
      
      // Validate user permission based on role and status
      const canUpdateStatus = await validateStatusUpdatePermission(
        socket.user,
        orderId,
        status
      );
      
      if (!canUpdateStatus) {
        return socket.emit('error', { 
          message: 'You do not have permission to update this order status' 
        });
      }
      
      // Update order status
      const order = await Order.findById(orderId);
      
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      
      // Update order status
      order.status = status;
      order.statusTimeline.push({
        status,
        timestamp: new Date(),
        note: note || null
      });
      
      // Add specific status updates
      if (status === 'delivered') {
        order.actualDeliveryTime = new Date();
      }
      
      await order.save();
      
      // Notify all relevant parties
      notifyOrderUpdate(order);
      
      socket.emit('success', { message: 'Order status updated successfully' });
      
    } catch (error) {
      logger.error('Order status update error:', error);
      socket.emit('error', { message: 'Failed to update order status' });
    }
  });
  
  // Location update for delivery partner
  socket.on('location:update', async (data) => {
    try {
      if (socket.user.role !== 'delivery') {
        return socket.emit('error', { 
          message: 'Only delivery partners can update location' 
        });
      }
      
      const { latitude, longitude } = data;
      
      // Update user location
      await User.findByIdAndUpdate(socket.user._id, {
        'deliveryDetails.currentLocation': {
          type: 'Point',
          coordinates: [longitude, latitude]
        }
      });
      
      // Find active orders for this delivery partner
      const activeOrders = await Order.find({
        deliveryPartner: socket.user._id,
        status: { $in: ['picked', 'on_the_way'] }
      });
      
      // Notify customers about updated location
      activeOrders.forEach(order => {
        io.to(`user:${order.customer}`).emit('location:update', {
          orderId: order._id,
          location: { latitude, longitude }
        });
      });
      
      socket.emit('success', { message: 'Location updated successfully' });
      
    } catch (error) {
      logger.error('Location update error:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });
}

// Handle location events
function handleLocationEvents(socket) {
  // Customer requesting delivery partner location
  socket.on('location:request', async (data) => {
    try {
      const { orderId } = data;
      
      // Find order
      const order = await Order.findById(orderId);
      
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      
      // Check if user is authorized to see this order
      if (
        socket.user.role === 'customer' && !order.customer.equals(socket.user._id) ||
        socket.user.role === 'restaurant' && !order.restaurant.equals(socket.user._id)
      ) {
        return socket.emit('error', { message: 'Unauthorized access' });
      }
      
      // Get delivery partner location
      if (!order.deliveryPartner) {
        return socket.emit('error', { message: 'No delivery partner assigned yet' });
      }
      
      const deliveryPartner = await User.findById(order.deliveryPartner);
      
      if (!deliveryPartner || !deliveryPartner.deliveryDetails.currentLocation) {
        return socket.emit('error', { message: 'Location not available' });
      }
      
      // Send location to requester
      const location = deliveryPartner.deliveryDetails.currentLocation;
      socket.emit('location:response', {
        orderId,
        location: {
          latitude: location.coordinates[1],
          longitude: location.coordinates[0]
        }
      });
      
    } catch (error) {
      logger.error('Location request error:', error);
      socket.emit('error', { message: 'Failed to get location' });
    }
  });
}

// Notify all parties about order update
function notifyOrderUpdate(order) {
  try {
    // Prepare notification data
    const notificationData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      updatedAt: order.statusTimeline[order.statusTimeline.length - 1].timestamp
    };
    
    // Notify customer
    io.to(`user:${order.customer}`).emit('order:status_update', notificationData);
    
    // Notify restaurant
    io.to(`restaurant:${order.restaurant}`).emit('order:status_update', notificationData);
    
    // Notify delivery partner if assigned
    if (order.deliveryPartner) {
      io.to(`delivery:${order.deliveryPartner}`).emit('order:status_update', notificationData);
    }
    
    // Notify admin
    io.to('role:admin').emit('order:status_update', notificationData);
    
    // Special notifications for specific statuses
    switch(order.status) {
      case 'placed':
        io.to(`restaurant:${order.restaurant}`).emit('order:placed', {
          ...notificationData,
          message: 'New order received!'
        });
        break;
        
      case 'ready':
        // Notify available delivery partners about new pickup
        io.to('role:delivery').emit('order:ready_for_pickup', {
          ...notificationData,
          restaurant: order.restaurant,
          message: 'New order ready for pickup!'
        });
        break;
        
      case 'delivered':
        // Create notification for customer to rate order
        io.to(`user:${order.customer}`).emit('order:rate_request', {
          ...notificationData,
          message: 'How was your order? Please rate your experience!'
        });
        break;
    }
    
  } catch (error) {
    logger.error('Notify order update error:', error);
  }
}

// Validate status update permission
async function validateStatusUpdatePermission(user, orderId, newStatus) {
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      return false;
    }
    
    // Admin can update any status
    if (user.role === 'admin') {
      return true;
    }
    
    // Restaurant can update specific statuses
    if (user.role === 'restaurant') {
      // Check if order belongs to this restaurant
      if (!order.restaurant.equals(user._id)) {
        return false;
      }
      
      // Restaurant can update to these statuses
      const allowedStatuses = ['confirmed', 'preparing', 'ready'];
      return allowedStatuses.includes(newStatus);
    }
    
    // Delivery partner can update specific statuses
    if (user.role === 'delivery') {
      // Check if order is assigned to this delivery partner
      if (!order.deliveryPartner || !order.deliveryPartner.equals(user._id)) {
        return false;
      }
      
      // Delivery partner can update to these statuses
      const allowedStatuses = ['picked', 'on_the_way', 'delayed', 'delivered'];
      return allowedStatuses.includes(newStatus);
    }
    
    // Customer can only cancel their own order
    if (user.role === 'customer') {
      // Check if order belongs to this customer
      if (!order.customer.equals(user._id)) {
        return false;
      }
      
      // Customer can only cancel order in certain statuses
      if (newStatus === 'cancelled') {
        const cancellableStatuses = ['placed', 'confirmed'];
        return cancellableStatuses.includes(order.status);
      }
      
      return false;
    }
    
    return false;
  } catch (error) {
    logger.error('Validate permission error:', error);
    return false;
  }
}