import React from 'react';
import { BACKEND_URL } from '@/utils/utils';

interface PromoBannerProps {
  image?: string;
}

const getImageUrl = (image?: string) => {
  if (!image) return '';
  return image.startsWith('http') ? image : `${BACKEND_URL}${image}`;
};

const PromoBanner: React.FC<PromoBannerProps> = ({ image }) => (
  <div className="promo-banner flex items-center justify-center bg-white shadow rounded-xl border border-gray-200 overflow-hidden w-full h-[80px] min-h-[80px] max-h-[120px]">
    {image && (
      <img
        src={getImageUrl(image)}
        alt=""
        className="h-full w-full object-cover"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    )}
  </div>
);

export default PromoBanner;