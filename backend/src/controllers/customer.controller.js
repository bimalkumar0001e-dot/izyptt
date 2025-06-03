const User = require('../models/user.model');
const Product = require('../models/product');
const PickupDrop = require('../models/PickupDrop.model');
// const Restaurant = require('../models/restaurant');
const Order = require('../models/order');
const Cart = require('../models/cart.model'); // If you have a Cart model
const Offer = require('../models/offer.model'); // Make sure you have this model
const Notification = require('../models/notification.model'); // Make sure you have this model
const notificationService = require('../services/notificationService'); // <-- Add this line
const bcrypt = require('bcryptjs');
const PaymentMethod = require('../models/paymentMethod.model');

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
    // Only allow updating name, email, avatar
    const updateFields = {};
    if (req.body.name !== undefined) updateFields.name = req.body.name;
    if (req.body.email !== undefined) updateFields.email = req.body.email;
    if (req.body.avatar !== undefined) updateFields.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
};

// ===== Address Management =====

// View all addresses
exports.viewAddresses = async (req, res) => {
  try {
    // req.user is already populated by the auth middleware
    res.json(req.user.addresses || []);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching addresses', error: err });
  }
};

// Add a new address
exports.addNewAddress = async (req, res) => {
  try {
    const {
      title,
      fullAddress,
      landmark,
      city,
      pincode,
      isDefault,
      state // may be undefined
    } = req.body;

    // If isDefault is true, unset isDefault on all other addresses
    if (isDefault) {
      req.user.addresses.forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      type: 'home', // Always use a valid enum value
      // Optionally, you can add a custom label field if you want to store the title
      // label: title,
      address: fullAddress,
      landmark,
      city,
      state: state || 'Bihar',
      pincode,
      isDefault: !!isDefault
    };

    req.user.addresses.push(newAddress);
    await req.user.save();
    res.json({ message: 'Address added', addresses: req.user.addresses });
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(500).json({ message: 'Error adding address', error: err });
  }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    const idx = req.user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (idx === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const {
      title,
      fullAddress,
      landmark,
      city,
      pincode,
      isDefault,
      state // may be undefined
    } = req.body;

    if (isDefault) {
      req.user.addresses.forEach(addr => addr.isDefault = false);
    }

    req.user.addresses[idx] = {
      ...req.user.addresses[idx]._doc,
      type: 'home', // Always use a valid enum value
      // label: title,
      address: fullAddress || req.user.addresses[idx].address,
      landmark: landmark !== undefined ? landmark : req.user.addresses[idx].landmark,
      city: city || req.user.addresses[idx].city,
      state: state || req.user.addresses[idx].state || 'Bihar',
      pincode: pincode || req.user.addresses[idx].pincode,
      isDefault: !!isDefault
    };

    await req.user.save();
    res.json({ message: 'Address updated', addresses: req.user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Error updating address', error: err });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;
    req.user.addresses = req.user.addresses.filter(addr => addr._id.toString() !== addressId);
    await req.user.save();
    res.json({ message: 'Address deleted', addresses: req.user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting address', error: err });
  }
};

// ===== Restaurant & Product Browsing =====
exports.viewAllRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({ 
      role: 'restaurant', 
      isApproved: true, 
      status: 'active' 
    }).select('-password');
    // Map to frontend structure
    const mapped = restaurants.map(r => ({
      _id: r._id,
      name: r.restaurantDetails?.name || r.name,
      description: r.restaurantDetails?.description || '',
      image: r.restaurantDetails?.image || 'https://your-default-image-url.jpg',
      categories: r.restaurantDetails?.categories || r.restaurantDetails?.cuisineType || [],
      rating: r.restaurantDetails?.rating || 4.3,
      ratingCount: r.restaurantDetails?.ratingCount || 0,
      minOrder: r.restaurantDetails?.minOrder || 100,
      deliveryTime: r.restaurantDetails?.deliveryTime || 30,
      deliveryFee: r.restaurantDetails?.deliveryFee || 40,
      address: r.restaurantDetails?.address || '',
      isOpen: r.restaurantDetails?.isOpen || true,
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurants', error: err });
  }
};

exports.viewRestaurantDetails = async (req, res) => {
  try {
    const restaurant = await User.findById(req.params.id).select('-password');
    if (!restaurant || restaurant.role !== 'restaurant') {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    // Flatten restaurantDetails for frontend
    const details = restaurant.restaurantDetails || {};
    res.json({
      _id: restaurant._id,
      name: details.name || restaurant.name,
      description: details.description || '',
      image: details.image || '',
      categories: details.categories || details.cuisineType || [],
      rating: details.rating || 4.3,
      ratingCount: details.ratingCount || 0,
      minOrder: details.minOrder || 100,
      deliveryTime: details.deliveryTime || 30,
      deliveryFee: details.deliveryFee || 40,
      address: details.address || '',
      isOpen: details.isOpen !== undefined ? details.isOpen : true,
      // Optionally add more fields as needed
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching restaurant details', error: err });
  }
};

exports.viewRestaurantProducts = async (req, res) => {
  try {
    const products = await Product.find({ restaurant: req.params.restaurantId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
};

exports.searchRestaurants = async (req, res) => {
  try {
    const { q } = req.query;
    const restaurants = await User.find({
      role: 'restaurant',
      isApproved: true,
      status: 'active',
      name: { $regex: q, $options: 'i' }
    }).select('-password');
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error searching restaurants', error: err });
  }
};

exports.viewAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    // Map to frontend structure and include restaurant name
    const mapped = await Promise.all(products.map(async p => {
      let restaurantName = "Restaurant";
      if (p.restaurant) {
        const restaurantDoc = await User.findById(p.restaurant).select('name restaurantDetails.name');
        restaurantName = restaurantDoc?.restaurantDetails?.name || restaurantDoc?.name || "Restaurant";
      }
      return {
        _id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        // Ensure category is always a string (fallback to "Other" if missing)
        category: typeof p.category === 'string' && p.category.trim() ? p.category.trim() : "Other",
        image: p.image,
        rating: p.rating || 4.5,
        ratingCount: p.ratingCount || 0,
        stock: p.stock,
        restaurant: p.restaurant,
        restaurantName,
        isAvailable: p.isAvailable,
      };
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
};

exports.viewProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product details', error: err });
  }
};

// filepath: /Users/deepakkumar/Desktop/ezypt/backend/src/controllers/customer.controller.js
exports.searchProduct = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const regex = new RegExp(q, 'i'); // case-insensitive partial match
    const products = await Product.find({
      $or: [
        { name: regex },
        { description: regex }
      ]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error searching products', error: err });
  }
};

// ===== Cart Management =====
exports.viewCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.json({
        items: [],
        totals: {
          subtotal: 0,
          itemCount: 0,
          totalQuantity: 0
        }
      });
    }
    // Calculate totals
    const totals = cart.calculateTotals ? cart.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };
    res.json({
      items: cart.items,
      totals
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) cart = new Cart({ customer: req.user.id, items: [] });
    const { productId, quantity } = req.body;
    const idx = cart.items.findIndex(item => item.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].quantity += quantity;
    } else {
      // Fetch product details for price, name
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        name: product.name,
        // Restaurant field is optional now
      });
      // REMOVED: Setting restaurantId - no longer needed
    }
    await cart.save();
    // Populate for response
    await cart.populate('items.product');
    const totals = cart.calculateTotals ? cart.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };
    res.json({
      message: 'Item added to cart',
      items: cart.items,
      totals
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const { productId, quantity } = req.body;
    const idx = cart.items.findIndex(item => item.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ message: 'Item not found in cart' });
    if (quantity <= 0) {
      // Remove item if quantity is zero or less
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }
    
    // REMOVED: restaurant clearing code
    
    await cart.save();
    await cart.populate('items.product');
    const totals = cart.calculateTotals ? cart.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };
    res.json({
      message: 'Cart item updated',
      items: cart.items,
      totals
    });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const beforeCount = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    // If cart is empty after removal, clear restaurantId and appliedOffer
    if (cart.items.length === 0) {
      cart.restaurantId = null;
      cart.appliedOffer = null;
    }
    await cart.save();
    await cart.populate('items.product');
    const totals = cart.calculateTotals ? cart.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };
    res.json({
      message: 'Item removed from cart',
      items: cart.items,
      totals
    });
  } catch (err) {
    res.status(500).json({ message: 'Error removing from cart', error: err });
  }
};

// ===== Order Management =====
exports.placeNewOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // Calculate totals and extract restaurant from first valid product
    let totalAmount = 0;
    let restaurant = null;
    const items = cart.items.map(item => {
      const productDoc = item.product;
      const price = item.price || (productDoc && productDoc.price) || 0;
      const quantity = item.quantity;
      const total = price * quantity;
      totalAmount += total;
      // Set restaurant from first valid product
      if (!restaurant && productDoc && productDoc.restaurant) {
        restaurant = productDoc.restaurant.toString();
      }
      return {
        product: productDoc && productDoc._id ? productDoc._id : item.product,
        name: item.name || (productDoc && productDoc.name),
        price,
        quantity,
        total
      };
    });

    // Apply offer discount if applicable
    let appliedOfferId = null;
    let finalAmount = totalAmount;
    let discount = 0;
    
    if (req.body.appliedOffer) {
      try {
        // Find the offer by code
        const offer = await Offer.findOne({ code: req.body.appliedOffer, isActive: true });
        
        if (offer) {
          // Check if the offer is valid (not expired and within usage limits)
          const now = new Date();
          const validTimeframe = now >= offer.validFrom && now <= offer.validTo;
          
          // Check global usage limit
          const withinGlobalLimit = !offer.limitedTo || offer.usageCount < offer.limitedTo;
          
          // Check per-customer usage limit
          const customerUsage = offer.customerUsage?.get(req.user.id.toString()) || 0;
          const withinCustomerLimit = customerUsage < (offer.perCustomerLimit || 1);
          
          // Check minimum order value
          const meetsMinOrderValue = !offer.minOrderValue || totalAmount >= offer.minOrderValue;
          
          if (validTimeframe && withinGlobalLimit && withinCustomerLimit && meetsMinOrderValue) {
            // Calculate discount
            if (offer.discountType === 'percentage') {
              discount = (totalAmount * offer.discountValue) / 100;
              if (offer.maxDiscount && discount > offer.maxDiscount) {
                discount = offer.maxDiscount;
              }
            } else {
              discount = offer.discountValue;
            }
            
            finalAmount = totalAmount - discount;
            appliedOfferId = offer._id;
            
            // Increment offer usage count and customer usage
            offer.usageCount += 1;
            if (!offer.customerUsage) {
              offer.customerUsage = new Map();
            }
            offer.customerUsage.set(req.user.id.toString(), customerUsage + 1);
            await offer.save();
            
            console.log(`Applied offer ${offer.code}, new usage count: ${offer.usageCount}`);
          }
        }
      } catch (offerError) {
        console.error('Error applying offer:', offerError);
        // Continue without applying the offer
      }
    }

    // Map frontend payment method code to allowed enum values
    let paymentMethod = req.body.paymentMethod;
    // Add mapping logic here
    if (paymentMethod === 'cash' || paymentMethod === 'cod' || paymentMethod === 'cashondelivery') {
      paymentMethod = 'cash';
    } else if (paymentMethod === 'upi') {
      paymentMethod = 'upi';
    } else if (
      paymentMethod === 'credit' ||
      paymentMethod === 'debit' ||
      paymentMethod === 'card' ||
      paymentMethod === 'online'
    ) {
      paymentMethod = 'online';
    }

    // Use new Order() and save() to ensure pre-save hook runs before validation
    const orderData = {
      customer: req.user.id,
      restaurant: restaurant, // Can be null now
      items,
      totalAmount,
      discount: discount,
      finalAmount: finalAmount,
      deliveryAddress: req.body.deliveryAddress,
      paymentMethod, // use mapped value
      status: 'placed',
      appliedOffer: appliedOfferId, // Include the applied offer ID
    };

    // Log for debugging
    console.log('Creating new order with data:', orderData);

    const order = new Order(orderData);
    await order.save();

    cart.items = [];
    if (cart.restaurantId) cart.restaurantId = null;
    if (cart.appliedOffer) cart.appliedOffer = null;
    await cart.save();

    // --- Create notifications for admin and restaurant ---
    // 1. Admin notification
    const adminUsers = await require('../models/user.model').find({ role: 'admin' }).select('_id');
    const adminNotificationPromises = adminUsers.map(admin =>
      Notification.create({
        user: admin._id,
        message: `New order placed (Order ID: ${order._id})`,
        type: 'order'
      })
    );
    // 2. Restaurant notification
    let restaurantNotification = null;
    if (order.restaurant) {
      restaurantNotification = Notification.create({
        user: order.restaurant,
        message: `You have received a new order (Order ID: ${order._id})`,
        type: 'order'
      });
    }
    await Promise.all([...adminNotificationPromises, restaurantNotification]);

    // --- Real-time notifications ---
    // Admin: send to all admins (role:admin room)
    notificationService.sendRealTimeNotification(
      'role:admin',
      {
        type: 'order',
        title: 'New Order Placed',
        message: `New order placed (Order ID: ${order._id})`,
        orderId: order._id
      }
    );
    // Restaurant: send to restaurant room
    if (order.restaurant) {
      notificationService.sendRealTimeNotification(
        `restaurant:${order.restaurant}`,
        {
          type: 'order',
          title: 'New Order Received',
          message: `You have received a new order (Order ID: ${order._id})`,
          orderId: order._id
        }
      );
    }

    // Populate restaurant name for confirmation response
    let restaurantName = 'Restaurant';
    if (order.restaurant) {
      try {
        const restaurantDoc = await require('../models/user.model').findById(order.restaurant).select('name restaurantDetails.name');
        restaurantName = restaurantDoc?.restaurantDetails?.name || restaurantDoc?.name || 'Restaurant';
      } catch {}
    }

    const mappedOrder = {
      id: order._id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurant,
      restaurantName,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      discount: discount,
      total: order.finalAmount || order.totalAmount || 0,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      createdAt: order.createdAt,
      ...order.toObject()
    };

    res.status(201).json({ message: 'Order placed', order: mappedOrder });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ message: 'Error placing order', error: err.message });
  }
};

exports.viewAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id });
    // Populate product images for each item in each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const itemsWithImages = await Promise.all(
          order.items.map(async (item) => {
            let image = null;
            try {
              const product = await Product.findById(item.product);
              image = product?.image || null;
            } catch {}
            return {
              ...item.toObject(),
              image,
            };
          })
        );
        return {
          ...order.toObject(),
          items: itemsWithImages,
        };
      })
    );
    res.json(populatedOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
};

exports.viewOrderDetails = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Populate restaurant name from User model
    let restaurantName = 'Restaurant';
    if (order.restaurant) {
      try {
        const restaurantDoc = await require('../models/user.model').findById(order.restaurant).select('name restaurantDetails.name');
        restaurantName = restaurantDoc?.restaurantDetails?.name || restaurantDoc?.name || 'Restaurant';
      } catch {}
    }

    // Populate product images for each item
    const itemsWithImages = await Promise.all(
      order.items.map(async (item) => {
        let image = null;
        try {
          const product = await Product.findById(item.product);
          image = product?.image || null;
        } catch {}
        return {
          ...item.toObject(),
          image,
        };
      })
    );

    // Map/rename fields for frontend
    const mappedOrder = {
      id: order._id,
      orderNumber: order.orderNumber,
      restaurantId: order.restaurant,
      restaurantName,
      items: itemsWithImages,
      total: order.finalAmount || order.totalAmount || 0,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      createdAt: order.createdAt,
      ...order.toObject() // fallback for any extra fields needed
    };

    res.json(mappedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order details', error: err });
  }
};

exports.trackOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ status: order.status, timeline: order.timeline });
  } catch (err) {
    res.status(500).json({ message: 'Error tracking order', error: err });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    // Only allow cancel within 5 minutes of placing and if not already cancelled/delivered
    const now = Date.now();
    const createdAt = new Date(order.createdAt).getTime();
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage.' });
    }
    if (now - createdAt > 5 * 60 * 1000) {
      return res.status(400).json({ message: 'Order can only be cancelled within 5 minutes of placing for a full refund.' });
    }
    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order', error: err });
  }
};

exports.rateDeliveredOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user.id, status: 'Delivered' });
    if (!order) return res.status(404).json({ message: 'Order not found or not delivered yet' });
    order.rating = req.body.rating;
    order.review = req.body.review;
    await order.save();
    res.json({ message: 'Order rated', order });
  } catch (err) {
    res.status(500).json({ message: 'Error rating order', error: err });
  }
};

// ===== Payments =====
exports.viewPaymentMethods = async (req, res) => {
  try {
    // Fetch all active payment methods from DB
    const methods = await PaymentMethod.find({ active: true });
    // Optionally, filter out disabled for this user
    const user = await User.findById(req.user.id);
    const disabled = user.disabledPaymentMethods || [];
    // Return code (enum value) and name (display)
    const available = methods
      .filter(m => !disabled.includes(m._id.toString()) && !disabled.includes(m.name))
      .map(m => ({
        id: m._id,
        code: (m.name || '').toLowerCase().replace(/[^a-z0-9]/g, ''), // e.g. "Cash on Delivery" -> "cashondelivery"
        name: m.name,
        description: m.description,
        image: m.image,
        details: m.details,
        paymentGuide: m.paymentGuide,
        instructions: m.instructions,
      }));
    res.json(available);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payment methods', error: err });
  }
};

// ===== Promotions and Offers =====
exports.viewAvailableOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ active: true });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching offers', error: err });
  }
};

exports.validatePromoCode = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ message: 'Promo code is required' });
    
    const now = new Date();
    const offer = await Offer.findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') }, // Case-insensitive match
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now }
    });
    
    if (!offer) return res.status(404).json({ message: 'Invalid or expired promo code' });
    
    // Check usage limits
    if (offer.limitedTo && offer.usageCount >= offer.limitedTo) {
      return res.status(400).json({ message: 'This promo code has reached its usage limit' });
    }
    
    // Check per-customer usage limit
    if (offer.perCustomerLimit) {
      const customerUsageCount = offer.customerUsage.get(req.user.id.toString()) || 0;
      if (customerUsageCount >= offer.perCustomerLimit) {
        return res.status(400).json({ 
          message: `You've already used this promo code ${offer.perCustomerLimit} time(s)` 
        });
      }
    }
    
    res.json({ valid: true, offer });
  } catch (err) {
    console.error('Error validating promo code:', err);
    res.status(500).json({ message: 'Error validating promo code', error: err.message });
  }
};

exports.applyPromoCodeToCart = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Promo code is required' });
    const now = new Date();
    const offer = await Offer.findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') },
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now }
    });
    if (!offer) return res.status(404).json({ message: 'Invalid or expired promo code' });
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.appliedOffer = offer._id;
    await cart.save();
    res.json({ message: 'Promo code applied', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error applying promo code', error: err });
  }
};

// ===== Notifications =====
// exports.viewNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching notifications', error: err });
//   }
// }; 

// Book a new pickup
exports.bookPickup = async (req, res) => {
  try {
    const { pickupAddress, dropAddress, itemType, note } = req.body;
    const pickup = new PickupDrop({
      customer: req.user.id,
      pickupAddress,
      dropAddress,
      itemType,
      note
    });
    await pickup.save();

    // --- Create notification for admin ---
    const adminUsers = await require('../models/user.model').find({ role: 'admin' }).select('_id');
    const adminNotificationPromises = adminUsers.map(admin =>
      Notification.create({
        user: admin._id,
        message: `New pickup booked (Pickup ID: ${pickup._id})`,
        type: 'system'
      })
    );
    await Promise.all(adminNotificationPromises);

    // --- Real-time notification for admin ---
    notificationService.sendRealTimeNotification(
      'role:admin',
      {
        type: 'system',
        title: 'New Pickup Booked',
        message: `New pickup booked (Pickup ID: ${pickup._id})`,
        pickupId: pickup._id
      }
    );

    res.status(201).json({ message: 'Pickup booked successfully', pickup });
  } catch (err) {
    console.error('Error booking pickup:', err);
    res.status(500).json({ message: 'Error booking pickup', error: err });
  }
};

// Get all pickups for logged-in customer
exports.getMyPickups = async (req, res) => {
  try {
    const pickups = await PickupDrop.find({ customer: req.user.id }).sort({ createdAt: -1 });
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickups', error: err });
  }
};
// View single pickup details
exports.viewPickupDetails = async (req, res) => {
  try {
    const pickup = await PickupDrop.findOne({ _id: req.params.id, customer: req.user.id });
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    res.json(pickup);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pickup details', error: err });
  }
};

// Cancel a pickup (customer-side)
exports.cancelPickup = async (req, res) => {
  try {
    const pickup = await PickupDrop.findOne({ _id: req.params.id, customer: req.user.id });
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });
    if (pickup.status === 'Cancelled') return res.status(400).json({ message: 'Pickup already cancelled' });
    pickup.status = 'Cancelled';
    pickup.cancelReason = req.body.reason || 'Cancelled by customer';
    await pickup.save();
    res.json({ message: 'Pickup cancelled', pickup });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling pickup', error: err });
  }
};

// Select a favourite restaurant
exports.selectFavouriteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    if (!restaurantId) return res.status(400).json({ message: 'restaurantId is required' });
    if (!req.user.favouriteRestaurants.includes(restaurantId)) {
      req.user.favouriteRestaurants.push(restaurantId);
      await req.user.save();
    }
    res.json({ message: 'Restaurant added to favourites', favouriteRestaurants: req.user.favouriteRestaurants });
  } catch (err) {
    res.status(500).json({ message: 'Error adding favourite restaurant', error: err });
  }
};

// Deselect a favourite restaurant
exports.deselectFavouriteRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    if (!restaurantId) return res.status(400).json({ message: 'restaurantId is required' });
    req.user.favouriteRestaurants = req.user.favouriteRestaurants.filter(id => id.toString() !== restaurantId);
    await req.user.save();
    res.json({ message: 'Restaurant removed from favourites', favouriteRestaurants: req.user.favouriteRestaurants });
  } catch (err) {
    res.status(500).json({ message: 'Error removing favourite restaurant', error: err });
  }
};

// View all favourite restaurants
exports.viewAllFavouriteRestaurants = async (req, res) => {
  try {
    await req.user.populate('favouriteRestaurants');
    const restaurants = (req.user.favouriteRestaurants || []).map(r => {
      const details = r.restaurantDetails || {};
      return {
        _id: r._id,
        name: details.name || r.name,
        description: details.description || '',
        image: details.image || '/uploads/default-restaurant.jpg', // <-- Always provide a fallback
        categories: details.categories || details.cuisineType || [],
        rating: details.rating || 4.3,
        ratingCount: details.ratingCount || 0,
        minOrder: details.minOrder || 100,
        deliveryTime: details.deliveryTime || 30,
        deliveryFee: details.deliveryFee || 40,
        address: details.address || '',
        isOpen: details.isOpen !== undefined ? details.isOpen : true,
      };
    });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favourite restaurants', error: err });
  }
};

// Select a favourite food item
exports.selectFavouriteFoodItem = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });
    if (!req.user.favouriteFoodItems.includes(productId)) {
      req.user.favouriteFoodItems.push(productId);
      await req.user.save();
    }
    res.json({ message: 'Food item added to favourites', favouriteFoodItems: req.user.favouriteFoodItems });
  } catch (err) {
    res.status(500).json({ message: 'Error adding favourite food item', error: err });
  }
};

// Deselect a favourite food item
exports.deselectFavouriteFoodItem = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });
    req.user.favouriteFoodItems = req.user.favouriteFoodItems.filter(id => id.toString() !== productId);
    await req.user.save();
    res.json({ message: 'Food item removed from favourites', favouriteFoodItems: req.user.favouriteFoodItems });
  } catch (err) {
    res.status(500).json({ message: 'Error removing favourite food item', error: err });
  }
};

// View all favourite food items
exports.viewAllFavouriteFoodItems = async (req, res) => {
  try {
    await req.user.populate('favouriteFoodItems');
    // Map products to include restaurantName
    const products = await Promise.all(
      (req.user.favouriteFoodItems || []).map(async (p) => {
        let restaurantName = "Restaurant";
        if (p.restaurant) {
          // Try to get restaurant name from User model
          try {
            const restaurantDoc = await require('../models/user.model').findById(p.restaurant).select('name restaurantDetails.name');
            restaurantName = restaurantDoc?.restaurantDetails?.name || restaurantDoc?.name || "Restaurant";
          } catch {}
        }
        return {
          _id: p._id,
          name: p.name,
          description: p.description,
          price: p.price,
          discountedPrice: p.discountedPrice,
          category: p.category,
          image: p.image,
          restaurant: p.restaurant,
          restaurantName,
          isAvailable: p.isAvailable,
        };
      })
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching favourite food items', error: err });
  }
};