import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Product } from '../types/product';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateCartTotals = (items: CartItem[]): Cart => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountedPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Delivery fee will be set to 0 by default, actual fee is fetched in OrderSummary
  const deliveryFee = 0;
  const tax = subtotal * 0.05;

  return {
    items,
    subtotal,
    deliveryFee,
    tax,
    total: subtotal + deliveryFee + tax
  };
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => calculateCartTotals([]));
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Fetch cart from backend on load if authenticated
  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) return;
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_BASE}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.data?.cart) {
          // Transform backend cart to frontend Cart type if needed
          setCart({
            items: res.data.data.cart.items.map((item: any) => {
              // Defensive: ensure product.image is a full URL
              let img = item.product?.image || '';
              if (img.startsWith('/uploads')) img = `http://localhost:5001${img}`;
              else if (img && !img.startsWith('http')) img = `http://localhost:5001/uploads/${img.replace('uploads/', '')}`;
              else if (!img) img = 'https://via.placeholder.com/400x300?text=Food';
              return {
                _id: item._id,
                product: { ...item.product, image: img },
                quantity: item.quantity
              };
            }),
            subtotal: res.data.data.totals.subtotal,
            deliveryFee: 0, // Always 0, actual fee shown in OrderSummary
            tax: res.data.data.totals.subtotal * 0.05,
            total: res.data.data.totals.subtotal + 0 + res.data.data.totals.subtotal * 0.05
          });
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  const addToCart = async (product: Product, quantity: number) => {
    if (!isAuthenticated) {
      toast({ title: 'Login required', description: 'Please login to add items to cart', variant: 'destructive' });
      return;
    }
    
    if (!product || (!product.id && !product._id)) {
      toast({ title: 'Error', description: 'Invalid product data', variant: 'destructive' });
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      // Ensure we're sending a valid product ID and log for debugging
      const productId = product.id || product._id;
      
      console.log('Adding to cart:', { 
        productId, 
        quantity, 
        product: {
          name: product.name,
          price: product.price,
          restaurant: product.restaurant || 'N/A',
          _id: product._id,
          id: product.id
        }
      });
      
      const res = await axios.post(`${API_BASE}/cart/add`, {
        productId,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Cart add response:', res.data);
      
      if (res.data?.data?.cart) {
        setCart({
          items: res.data.data.cart.items.map((item: any) => {
            // Defensive: ensure product.image is a full URL
            let img = item.product?.image || '';
            if (img.startsWith('/uploads')) img = `http://localhost:5001${img}`;
            else if (img && !img.startsWith('http')) img = `http://localhost:5001/uploads/${img.replace('uploads/', '')}`;
            else if (!img) img = 'https://via.placeholder.com/400x300?text=Food';
            
            return {
              _id: item._id,
              product: { 
                ...item.product, 
                image: img,
                // Ensure we always have the restaurant name if available
                restaurantName: item.product?.restaurantName || item.restaurant || ''
              },
              quantity: item.quantity
            };
          }),
          subtotal: res.data.data.totals.subtotal,
          deliveryFee: 0, // Always 0, actual fee shown in OrderSummary
          tax: res.data.data.totals.subtotal * 0.05,
          total: res.data.data.totals.subtotal + 0 + res.data.data.totals.subtotal * 0.05
        });
        
        toast({
          title: 'Added to Cart',
          description: `${product.name} added to your cart`,
          duration: 2000
        });
      }
    } catch (err: any) {
      console.error('Add to cart error:', err);
      
      // Log the full error response for debugging
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data
        });
      }
      
      // Extract error message from response if available
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to add to cart';
      toast({ 
        title: 'Error', 
        description: errorMsg, 
        variant: 'destructive' 
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.delete(`${API_BASE}/cart/item/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data?.cart) {
        setCart({
          items: res.data.data.cart.items.map((item: any) => {
            // Defensive: ensure product.image is a full URL
            let img = item.product?.image || '';
            if (img.startsWith('/uploads')) img = `http://localhost:5001${img}`;
            else if (img && !img.startsWith('http')) img = `http://localhost:5001/uploads/${img.replace('uploads/', '')}`;
            else if (!img) img = 'https://via.placeholder.com/400x300?text=Food';
            return {
              _id: item._id,
              product: { ...item.product, image: img },
              quantity: item.quantity
            };
          }),
          subtotal: res.data.data.totals.subtotal,
          deliveryFee: 0, // Always 0, actual fee shown in OrderSummary
          tax: res.data.data.totals.subtotal * 0.05,
          total: res.data.data.totals.subtotal + 0 + res.data.data.totals.subtotal * 0.05
        });
        toast({
          title: 'Item Removed',
          description: 'Item removed from your cart',
          duration: 2000
        });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`${API_BASE}/cart/item/${productId}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data?.cart) {
        setCart({
          items: res.data.data.cart.items.map((item: any) => {
            // Defensive: ensure product.image is a full URL
            let img = item.product?.image || '';
            if (img.startsWith('/uploads')) img = `http://localhost:5001${img}`;
            else if (img && !img.startsWith('http')) img = `http://localhost:5001/uploads/${img.replace('uploads/', '')}`;
            else if (!img) img = 'https://via.placeholder.com/400x300?text=Food';
            return {
              _id: item._id,
              product: { ...item.product, image: img },
              quantity: item.quantity
            };
          }),
          subtotal: res.data.data.totals.subtotal,
          deliveryFee: 0, // Always 0, actual fee shown in OrderSummary
          tax: res.data.data.totals.subtotal * 0.05,
          total: res.data.data.totals.subtotal + 0 + res.data.data.totals.subtotal * 0.05
        });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update quantity', variant: 'destructive' });
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(calculateCartTotals([]));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to clear cart', variant: 'destructive' });
    }
  };
  
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
