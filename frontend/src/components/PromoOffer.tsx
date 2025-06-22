import React from 'react';
import { Card } from '@/components/ui/card';

interface PromoOfferProps {
  image: string;
}

const PromoOffer: React.FC<PromoOfferProps> = ({ image }) => {
  return (
    <Card 
      className="p-0 flex items-center justify-center rounded-xl shadow-sm border-0 h-32 overflow-hidden"
      style={{
        boxShadow: '0 4px 24px 0 rgba(30, 41, 59, 0.10)',
      }}
    >
      {image ? (
        <img
          src={image}
          alt="Offer"
          className="w-full h-full object-cover"
          style={{ minHeight: '100%', minWidth: '100%' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
          No Image
        </div>
      )}
    </Card>
  );
};

export default PromoOffer;
