import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCart?: boolean;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Izypt',
  showBackButton = false,
  showCart = false,
  className
}) => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  
  return (
    <header className={cn(
      "sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200",
      className
    )}>
      <div className="flex items-center">
        {showBackButton && (
          <button 
            onClick={() => navigate(-1)} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      
      {showCart && (
        <button 
          onClick={() => navigate('/cart')} 
          className="relative p-1 rounded-full hover:bg-gray-100"
        >
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-app-primary text-white h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
              {itemCount}
            </Badge>
          )}
        </button>
      )}
    </header>
  );
};
