
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export const BottomNav: React.FC = () => {
  const { itemCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  return (
    <nav className="bottom-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => cn(
          'bottom-nav-item',
          isActive ? 'text-app-primary' : 'text-gray-500'
        )}
        end
      >
        <Home className="w-6 h-6" />
        <span>Home</span>
      </NavLink>
      
      <NavLink 
        to="/search" 
        className={({ isActive }) => cn(
          'bottom-nav-item',
          isActive ? 'text-app-primary' : 'text-gray-500'
        )}
      >
        <Search className="w-6 h-6" />
        <span>Search</span>
      </NavLink>
      
      <NavLink 
        to="/cart" 
        className={({ isActive }) => cn(
          'bottom-nav-item relative',
          isActive ? 'text-app-primary' : 'text-gray-500'
        )}
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-app-primary text-white h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
              {itemCount}
            </Badge>
          )}
        </div>
        <span>Cart</span>
      </NavLink>
      
      {isAuthenticated && user?.role === 'customer' && (
        <NavLink 
          to="/orders" 
          className={({ isActive }) => cn(
            'bottom-nav-item',
            isActive ? 'text-app-primary' : 'text-gray-500'
          )}
        >
          <Package className="w-6 h-6" />
          <span>Orders</span>
        </NavLink>
      )}
      
      <NavLink 
        to={isAuthenticated ? "/profile" : "/login"} 
        className={({ isActive }) => cn(
          'bottom-nav-item',
          isActive ? 'text-app-primary' : 'text-gray-500'
        )}
      >
        <User className="w-6 h-6" />
        <span>{isAuthenticated ? 'Profile' : 'Login'}</span>
      </NavLink>
    </nav>
  );
};
