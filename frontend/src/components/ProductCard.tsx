import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { ProductQuantitySelector } from './ProductQuantitySelector';

interface ProductCardProps {
  product: Product;
  hideAddToCart?: boolean;
  quantity?: number;
  cartItemId?: string; // Add cart item _id
  onAdd?: (product: Product) => void;
  onIncrease?: (cartItemId: string, product: Product) => void;
  onDecrease?: (cartItemId: string, product: Product) => void;
  isSiteDisabled?: boolean; // <-- Add this prop
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, hideAddToCart = false, quantity = 0, cartItemId, onAdd, onIncrease, onDecrease, isSiteDisabled = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Determine veg/non-veg icon color based on category (handles "non-veg" and "NonVeg" case-insensitively)
  const isNonVeg = typeof product.category === 'string' &&
    ['non-veg', 'nonveg'].includes(product.category.trim().toLowerCase());

  // Accept isAvailable from product prop, even if not in Product type
  const available = typeof (product as any).isAvailable === 'boolean' ? (product as any).isAvailable : true;

  const handleClick = () => {
    navigate(`/product/${product.id || product._id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAdd) onAdd(product);
    else addToCart(product, 1);
  };
  
  return (
    <div
      className="product-card cursor-pointer flex flex-col"
      style={{ height: 340, minHeight: 340, maxHeight: 340 }}
      onClick={handleClick}
    >
      <div className="relative w-full h-40 bg-white flex items-center justify-center rounded-t-xl">
        <img 
          src={product.image || 'https://via.placeholder.com/400x300?text=Food'}
          alt={product.name}
          className="w-full h-40 object-contain"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Food';
            console.log("Image failed to load:", product.image);
          }}
        />
        {/* Veg/Non-Veg icon */}
        <span 
          className={`absolute top-2 right-2 w-5 h-5 rounded-full ${
            isNonVeg ? 'bg-red-500' : 'bg-green-500'
          } flex items-center justify-center border-2 border-white`}
        >
          <span className="w-3 h-3 bg-white rounded-full"></span>
        </span>
      </div>
      
      <div className="p-3 flex flex-col flex-1 justify-between">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="font-semibold">
              ₹{typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
            </p>
            {product.discountedPrice && typeof product.discountedPrice === 'number' && (
              <p className="text-xs text-gray-500 line-through">
                ₹{product.discountedPrice.toFixed(2)}
              </p>
            )}
            {/* You can add more product details here if needed */}
          </div>
          {/* Hide both Add and quantity selector if site is disabled */}
          {isSiteDisabled ? null : (
            !hideAddToCart && !available ? (
              <Button 
                size="sm" 
                className="h-8 px-2 bg-[#F7B267] text-white rounded-xl font-bold flex items-center justify-center transition-all cursor-not-allowed"
                disabled
                style={{ minWidth: 80 }}
              >
                Unavailable
              </Button>
            ) : (!hideAddToCart && quantity === 0 ? (
              <Button 
                size="sm" 
                className="h-8 px-2 bg-app-primary hover:bg-app-accent text-white rounded-xl font-semibold flex items-center justify-center transition-all"
                onClick={handleAddToCart}
                style={{ minWidth: 80 }}
              >
                <Plus className="w-4 h-4 mr-1" />Add
              </Button>
            ) : (
              <div className="flex items-center h-8 bg-app-primary/10 rounded-xl shadow-sm px-1" style={{ minWidth: 80 }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDecrease && cartItemId && onDecrease(cartItemId, product); }}
                  className="px-2 py-1 text-app-primary font-bold rounded-l-xl focus:outline-none hover:bg-app-primary/20 transition"
                  aria-label="Decrease quantity"
                  style={{ borderRight: '1px solid #eee' }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 font-semibold text-gray-900 bg-white border-x border-gray-200" style={{ minWidth: 24, textAlign: 'center', borderRadius: 4 }}>
                  {quantity}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onIncrease && cartItemId && onIncrease(cartItemId, product); }}
                  className="px-2 py-1 text-app-primary font-bold rounded-r-xl focus:outline-none hover:bg-app-primary/20 transition"
                  aria-label="Increase quantity"
                  style={{ borderLeft: '1px solid #eee' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};