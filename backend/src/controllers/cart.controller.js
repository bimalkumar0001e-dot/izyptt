const Cart = require('../models/cart.model');
const Product = require('../models/product');
const { successResponse, errorResponse } = require('../utils/response');

// Get cart items
exports.getCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Find or create cart
    let cart = await Cart.findOne({ customer: customerId })
      .populate('items.product', 'name price image')
      .populate('restaurantId', 'name restaurantDetails.name')
      .populate('appliedPromotion')
      .lean();

    if (!cart) {
      return successResponse(res, 'Cart is empty', {
        cart: { items: [] },
        totals: {
          subtotal: 0,
          itemCount: 0,
          totalQuantity: 0
        }
      });
    }

    // Calculate totals
    const cartModel = new Cart(cart);
    const totals = cartModel.calculateTotals ? cartModel.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };

    return successResponse(res, 'Cart retrieved successfully', { cart, totals });

  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse(res, 'Failed to retrieve cart', 500);
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    // Improve logging for debugging
    console.log('Add to cart request:', {
      customerId,
      productId,
      quantity,
      body: req.body
    });

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400);
    }

    // Validate product with better error handling
    let product;
    try {
      product = await Product.findById(productId);
    } catch (err) {
      console.error('Error finding product:', err);
      return errorResponse(res, `Invalid product ID format: ${productId}`, 400);
    }

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Check if product is available - make this optional if needed
    if (product.isAvailable === false) {
      return errorResponse(res, 'Product is currently unavailable', 400);
    }

    // Find existing cart
    let cart = await Cart.findOne({ customer: customerId });

    // If no cart exists, create one
    if (!cart) {
      cart = new Cart({
        customer: customerId,
        items: []
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item with minimal required fields
      cart.items.push({
        product: productId,
        quantity: parseInt(quantity),
        price: product.price || 0,
        name: product.name || 'Product'
        // Restaurant field is now optional
      });
    }

    // If promotion was applied, clear it as cart changed
    if (cart.appliedPromotion) {
      cart.appliedPromotion = null;
    }

    await cart.save();

    // Get updated cart with populated data - remove restaurantId references
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image')
      .lean();

    // Calculate totals
    const cartModel = new Cart(updatedCart);
    const totals = cartModel.calculateTotals ? cartModel.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };

    return successResponse(res, 'Item added to cart successfully', {
      cart: updatedCart,
      totals
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    // Add more detailed error logging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    return errorResponse(res, 'Failed to add item to cart: ' + error.message, 500);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;
    const itemId = req.params.id;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return errorResponse(res, 'Quantity must be at least 1', 400);
    }

    // Find cart
    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return errorResponse(res, 'Item not found in cart', 404);
    }

    // Update quantity
    cart.items[itemIndex].quantity = parseInt(quantity);

    // If promotion was applied, clear it as cart changed
    if (cart.appliedPromotion) {
      cart.appliedPromotion = null;
    }

    await cart.save();

    // Get updated cart with populated data - remove restaurantId references
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image')
      .lean();

    // Calculate totals
    const cartModel = new Cart(updatedCart);
    const totals = cartModel.calculateTotals ? cartModel.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };

    return successResponse(res, 'Cart item updated successfully', {
      cart: updatedCart,
      totals
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    return errorResponse(res, 'Failed to update cart item', 500);
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;
    const itemId = req.params.id;

    // Find cart
    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return errorResponse(res, 'Cart not found', 404);
    }

    // Remove item
    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );

    // If promotion was applied, clear it as cart changed
    if (cart.appliedPromotion) {
      cart.appliedPromotion = null;
    }

    await cart.save();

    // Get updated cart with populated data - remove restaurantId references
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price image')
      .lean();

    // Calculate totals
    const cartModel = new Cart(updatedCart);
    const totals = cartModel.calculateTotals ? cartModel.calculateTotals() : {
      subtotal: 0,
      itemCount: 0,
      totalQuantity: 0
    };

    return successResponse(res, 'Item removed from cart successfully', {
      cart: updatedCart,
      totals
    });

  } catch (error) {
    console.error('Remove cart item error:', error);
    return errorResponse(res, 'Failed to remove item from cart', 500);
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    // Find cart
    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return successResponse(res, 'Cart is already empty', {
        cart: { items: [] },
        totals: {
          subtotal: 0,
          itemCount: 0,
          totalQuantity: 0
        }
      });
    }

    // Clear cart
    cart.items = [];
    // Remove restaurantId reference
    await cart.save();

    return successResponse(res, 'Cart cleared successfully', {
      cart: { items: [] },
      totals: {
        subtotal: 0,
        itemCount: 0,
        totalQuantity: 0
      }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    return errorResponse(res, 'Failed to clear cart', 500);
  }
};