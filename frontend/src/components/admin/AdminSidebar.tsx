import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Store,
  Truck,
  Package,
  Tag,
  UserCheck,
  Wallet,
  Bell,
  ScrollText,
  BarChart3,
  CreditCard,
  Image,
  FolderInput,
  HeadphonesIcon,
  Settings
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
{
      title: 'Notifications',
      icon: <Bell size={20} />,
      path: '/admin/notifications',
    },

    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard',
    },
    {
      title: 'User Management',
      icon: <Users size={20} />,
      children: [
        { title: 'Customers', path: '/admin/customers' },
        { title: 'Restaurants', path: '/admin/restaurants' },
        { title: 'Delivery Partners', path: '/admin/delivery-partners' },
        { title: 'ProfileWallpaper Management', path: '/admin/profile-wallpaper-management' }, // updated path
      ],
    },


    // {
    //   title: 'Cart Management',
    //   icon: <Package size={20} />,
    //   path: '/admin/products',
    // },

    {
      title: 'Product Management',
      icon: <Package size={20} />,
      path: '/admin/products',
    },
    
    {
      title: 'Order Management',
      icon: <ScrollText size={20} />,
      path: '/admin/orders',
    },
    

    {
  title: 'Section Management',
  icon: <Store size={20} />, // You can choose a different icon if you like
  path: '/admin/sections',
},
    {
      title: 'Offer Management',
      icon: <Tag size={20} />,
      path: '/admin/offers',
    },
    
    {
      title: 'Payment Methods',
      icon: <CreditCard size={20} />,
      path: '/admin/payment-methods',
    },
    {
      title: 'Banners & Ads',
      icon: <Image size={20} />,
      path: '/admin/banners',
    },
    {
      title: 'Pickup Management',
      icon: <FolderInput size={20} />,
      path: '/admin/pickup',
    },
    {
      title: 'Charges, Fees & Taxes',
      icon: <Tag size={20} />,
      path: '/admin/chargestaxesfees',
    },
    {
      title: 'Return Instruction Management',
      icon: <Tag size={20} />,
      path: '/admin/return-instructions',
    },
    
    



    {
      title: 'Customer Support',
      icon: <HeadphonesIcon size={20} />,
      path: '/admin/support',
    },

    {
      title: 'User Approval',
      icon: <UserCheck size={20} />,
      path: '/admin/approval',
    },
    {
      title: 'Financial Management',
      icon: <Wallet size={20} />,
      path: '/admin/finance',
    },
    {
      title: 'Reports & Analytics',
      icon: <BarChart3 size={20} />,
      path: '/admin/reports',
    },
    {
      title: 'System Settings',
      icon: <Settings size={20} />,
      path: '/admin/settings',
    },
    {
      title: 'Cart Management',
      icon: <Package size={20} />,
      path: '/admin/cart-management',
    },
  ];
  
  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className={cn(
          "font-semibold transition-all", 
          collapsed ? "text-center text-xl" : "text-2xl"
        )}>
          {collapsed ? "IZ" : "Izypt"}
        </h2>
        <p className={cn(
          "text-xs text-gray-500",
          collapsed && "hidden"
        )}>Admin Control Panel</p>
      </div>
      
      <div className="flex-1 py-2 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item, index) => (
            item.children ? (
              <div key={index} className="mb-2">
                <div className={cn(
                  "flex items-center py-2 px-3 text-gray-600 rounded-md mb-1",
                  collapsed ? "justify-center" : "justify-between"
                )}>
                  <div className="flex items-center">
                    <span className="text-gray-500">{item.icon}</span>
                    {!collapsed && (
                      <span className="ml-3 text-sm font-medium">{item.title}</span>
                    )}
                  </div>
                </div>
                
                {!collapsed && item.children.map((child, childIndex) => (
                  <NavLink
                    key={childIndex}
                    to={child.path}
                    className={({ isActive }) => cn(
                      "flex items-center py-2 px-3 text-sm rounded-md ml-6",
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {child.title}
                  </NavLink>
                ))}
              </div>
            ) : (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center py-2 px-3 rounded-md",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100",
                  collapsed && "justify-center"
                )}
              >
                <span className={isActive(item.path) ? "text-blue-700" : "text-gray-500"}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium">{item.title}</span>
                )}
              </NavLink>
            )
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className={cn(
          "text-xs text-gray-500",
          collapsed && "text-center"
        )}>
          {collapsed ? "v1.0" : "Admin Panel v1.0"}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
