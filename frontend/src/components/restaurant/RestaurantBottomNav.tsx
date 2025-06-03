import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, isActive }) => (
  <Link 
    to={to} 
    className={cn(
      "flex flex-col items-center p-2", 
      isActive ? "text-app-primary" : "text-gray-500"
    )}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </Link>
);

export const RestaurantBottomNav: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const isActive = (path: string) => {
    if (path === '/restaurant/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };
  
  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                 px-2 py-1 flex justify-around max-w-md mx-auto rounded-t-xl shadow z-40"
      style={{
        height: '56px',
        minHeight: 'unset',
        maxWidth: '420px',
      }}
    >
      <NavItem 
        to="/restaurant/dashboard" 
        label="Dashboard" 
        icon={<LayoutDashboard className="w-5 h-5" />}
        isActive={isActive('/restaurant/dashboard')}
      />
      <NavItem 
        to="/restaurant/orders" 
        label="Orders" 
        icon={<ShoppingBag className="w-5 h-5" />}
        isActive={isActive('/restaurant/orders')}
      />
      <NavItem 
        to="/restaurant/menu" 
        label="Menu" 
        icon={<Package className="w-5 h-5" />}
        isActive={isActive('/restaurant/menu')}
      />
      <NavItem 
        to="/restaurant/profile" 
        label="Profile" 
        icon={<User className="w-5 h-5" />}
        isActive={isActive('/restaurant/profile')}
      />
    </div>
  );
};

export default RestaurantBottomNav;
