import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, ShoppingCart, Truck, Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  type: 'party' | 'groceries' | 'pickup' | 'scrap';
  name: string;
  colorClass: string;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  type, 
  name, 
  colorClass, 
  onClick 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      switch (type) {
        case 'party':
          navigate('/restaurants');
          break;
        case 'groceries':
          navigate('/groceries');
          break;
        case 'pickup':
          navigate('/pickup-drop');
          break;
        case 'scrap':
          navigate('/sell-scrap');
          break;
      }
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'party':
        return <Cake className="w-6 h-6 text-white" />;
      case 'groceries':
        return <ShoppingCart className="w-6 h-6 text-white" />;
      case 'pickup':
        return <Truck className="w-6 h-6 text-white" />;
      case 'scrap':
        return <Recycle className="w-6 h-6 text-white" />;
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="flex flex-col items-center space-y-2"
    >
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-1 shadow-md",
        colorClass
      )}>
        {renderIcon()}
      </div>
      <span className="text-xs font-medium text-center">{name}</span>
    </button>
  );
};

export default ServiceCard;
