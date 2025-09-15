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
    <div className={`flex items-center border rounded-lg bg-app-primary/10 ${size === 'sm' ? 'text-sm h-8' : 'h-10'} px-1 shadow-sm`} style={{ minWidth: 80 }}>
      <button 
        onClick={onDecrease}
        className={`px-2 py-1 text-app-primary font-bold rounded-l-lg focus:outline-none hover:bg-app-primary/20 transition`}
        aria-label="Decrease quantity"
        style={{ borderRight: '1px solid #eee' }}
      >
        <Minus className={`w-${size === 'sm' ? '4' : '5'} h-${size === 'sm' ? '4' : '5'}`} />
      </button>
      <span className={`px-3 py-1 font-semibold text-gray-900 bg-white border-x border-gray-200`} style={{ minWidth: 24, textAlign: 'center', borderRadius: 4 }}>
        {quantity}
      </span>
      <button 
        onClick={onIncrease}
        className={`px-2 py-1 text-app-primary font-bold rounded-r-lg focus:outline-none hover:bg-app-primary/20 transition`}
        aria-label="Increase quantity"
        style={{ borderLeft: '1px solid #eee' }}
      >
        <Plus className={`w-${size === 'sm' ? '4' : '5'} h-${size === 'sm' ? '4' : '5'}`} />
      </button>
    </div>
  );
};
