
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductQuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  size?: 'sm' | 'default';
}

export const ProductQuantitySelector: React.FC<ProductQuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  size = 'default'
}) => {
  return (
    <div className={`flex items-center border border-gray-200 rounded-md ${size === 'sm' ? 'text-sm' : ''}`}>
      <button 
        onClick={onDecrease}
        className={`px-${size === 'sm' ? '1.5' : '2'} py-${size === 'sm' ? '0.5' : '1'} text-gray-600`}
        aria-label="Decrease quantity"
      >
        <Minus className={`w-${size === 'sm' ? '3' : '4'} h-${size === 'sm' ? '3' : '4'}`} />
      </button>
      <span className={`px-${size === 'sm' ? '2' : '3'} py-${size === 'sm' ? '0.5' : '1'} border-x border-gray-200`}>
        {quantity}
      </span>
      <button 
        onClick={onIncrease}
        className={`px-${size === 'sm' ? '1.5' : '2'} py-${size === 'sm' ? '0.5' : '1'} text-gray-600`}
        aria-label="Increase quantity"
      >
        <Plus className={`w-${size === 'sm' ? '3' : '4'} h-${size === 'sm' ? '3' : '4'}`} />
      </button>
    </div>
  );
};
