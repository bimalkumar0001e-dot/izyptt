import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  hideAddToCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, hideAddToCart = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Determine veg/non-veg icon color based on category (handles "non-veg" and "NonVeg" case-insensitively)
  const isNonVeg = typeof product.category === 'string' &&
    ['non-veg', 'nonveg'].includes(product.category.trim().toLowerCase());

  const handleClick = () => {
  navigate(`/product/${product.id || product._id}`);
};
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };
  
  return (
    <div
      className="product-card cursor-pointer flex flex-col"
      style={{ height: 340, minHeight: 340, maxHeight: 340 }} // <-- fixed height
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
        {/* Veg/Non-Veg icon based on category */}
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
          {!hideAddToCart && (
            <Button 
              size="sm" 
              className="h-8 px-2 bg-app-primary hover:bg-app-accent text-white"
              onClick={handleAddToCart}
              disabled={product.isAvailable === false}
            >
              {product.isAvailable === false ? "Unavailable" : <><Plus className="w-4 h-4 mr-1" />Add</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};