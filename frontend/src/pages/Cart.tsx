import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProductQuantitySelector } from '@/components/ProductQuantitySelector';
import { OrderSummary } from '@/components/OrderSummary';
import { Offer } from '@/types/product';
import { mockOffers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/ProductCard';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const UPLOADS_BASE = BACKEND_URL;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [minCartAmount, setMinCartAmount] = useState<number | null>(null);
  const [minCartActive, setMinCartActive] = useState<boolean>(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch min cart amount from backend
    fetch(`${BACKEND_URL}/api/admin/min-cart-amount/view`)
      .then(res => res.json())
      .then(data => {
        setMinCartAmount(typeof data.amount === 'number' ? data.amount : null);
        setMinCartActive(data.isActive !== false); // default to true if undefined
      })
      .catch(() => {
        setMinCartAmount(null);
        setMinCartActive(true);
      });
  }, []);

  useEffect(() => {
    // Fetch all products for suggestions
    fetch(`${API_BASE}/customer/products`)
      .then(res => res.json())
      .then(data => {
        setAllProducts(
          (data || []).map((p: any) => {
            let img = p.image || "";
            if (img.startsWith("/uploads")) img = `${UPLOADS_BASE}${img}`;
            else if (img && !img.startsWith("http")) img = `${UPLOADS_BASE}/uploads/${img.replace("uploads/", "")}`;
            else if (!img) img = `${UPLOADS_BASE}/uploads/default-food.jpg`;
            return { ...p, image: img, id: p._id };
          })
        );
      })
      .catch(() => setAllProducts([]));
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    navigate('/checkout');
  };
  
  const handleApplyPromoCode = async (code: string): Promise<Offer | null> => {
    // In a real app, this would be an API call
    const offer = mockOffers.find(
      o => o.code.toLowerCase() === code.toLowerCase() && o.isActive
    );
    
    if (offer) {
      if (offer.minOrderValue && cart.subtotal < offer.minOrderValue) {
        toast({
          title: "Cannot apply promo code",
          description: `Minimum order value is ₹${offer.minOrderValue}`,
          variant: "destructive",
        });
        return null;
      }
      
      setAppliedOffer(offer);
      toast({
        title: "Promo code applied",
        description: offer.title,
      });
      return offer;
    }
    
    return null;
  };

  const handleClearPromoCode = () => {
    setAppliedOffer(null);
    toast({
      title: "Promo code removed"
    });
  };
  
  if (cart.items.length === 0) {
    return (
      <div className="app-container">
        <AppHeader title="Cart" showBackButton />
        
        <div className="flex-1 p-4 flex flex-col items-center justify-center">
          <img 
            src="https://img.icons8.com/pastel-glyph/64/000000/empty-cart.png"
            alt="Empty Cart"
            className="w-24 h-24 mb-4 opacity-50"
          />
          <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
          <p className="text-gray-500 text-center mt-2 mb-4">
            Browse our delicious food and groceries to add items to your cart
          </p>
          <Button 
            onClick={() => navigate('/')}
            className="app-button-primary"
          >
            Browse Items
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <AppHeader title="Cart" showBackButton />
      
      <div className="flex-1 p-4 pb-32">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{cart.items.length} Items in Cart</h2>
          <button 
            onClick={clearCart}
            className="text-sm text-red-500 font-medium"
          >
            Clear Cart
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          {cart.items.map((item) => {
            let img = item.product.image || '';
            if (img.startsWith('/uploads')) img = `${UPLOADS_BASE}${img}`;
            else if (img && !img.startsWith('http')) img = `${UPLOADS_BASE}/uploads/${img.replace('uploads/', '')}`;
            else if (!img) img = `${UPLOADS_BASE}/uploads/default-food.jpg`;
            return (
              <div key={item._id} className="flex bg-white rounded-lg shadow-sm p-3 border border-gray-100">
                <img
                  src={img}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-md"
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item._id)} 
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Always display restaurant name if available */}
                  {(item.product.restaurant) && (
                    <p className="text-xs text-gray-500">
                      {item.product.restaurant}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-semibold">
                      ₹{((item.product.discountedPrice || item.product.price) * item.quantity).toFixed(2)}
                    </p>
                    
                    <ProductQuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(item._id, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item._id, item.quantity - 1)}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <OrderSummary cart={cart} appliedOffer={appliedOffer} />

        {/* --- Product Suggestions Row --- */}
        {allProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2">You may also like</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2" style={{ scrollbarWidth: 'none' }}>
              {/* Hide scrollbar for Webkit browsers */}
              <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
              `}</style>
              {allProducts.map(product => (
                <div key={product.id} className="min-w-[180px] max-w-[220px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        {minCartAmount !== null && minCartActive && cart.subtotal < minCartAmount && (
          <div className="mb-2 text-center text-red-600 font-medium text-sm">
            Minimum cart amount is ₹{minCartAmount}. Please add more items to proceed.
          </div>
        )}
        <Button 
          className="app-button app-button-primary w-full"
          onClick={handleCheckout}
          disabled={
            isProcessing ||
            (minCartAmount !== null && minCartActive && cart.subtotal < minCartAmount)
          }
        >
          {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </div>
    </div>
  );
};

export default Cart;
