import React from 'react';
import { Card } from '@/components/ui/card';
import { Tag } from 'lucide-react';

interface PromoOfferProps {
  title: string;
  description: string;
  backgroundColor: string;
  textColor?: string;
}

const PromoOffer: React.FC<PromoOfferProps> = ({ 
  title, 
  description, 
  backgroundColor, 
  textColor = "text-white"
}) => {
  return (
    <Card 
      className={`p-4 flex items-center ${backgroundColor} ${textColor} rounded-xl shadow-sm border-0 h-32`}
      style={{
        boxShadow: '0 4px 24px 0 rgba(30, 41, 59, 0.10)',
        overflow: 'hidden'
      }}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="p-3 bg-white/20 rounded-full flex items-center justify-center">
          <Tag className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{title}</h3>
          <p className="text-sm opacity-90 truncate">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default PromoOffer;
