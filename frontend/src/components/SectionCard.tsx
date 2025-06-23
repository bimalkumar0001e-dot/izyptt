import React from "react";
import { BACKEND_URL } from '@/utils/utils';

interface SectionCardProps {
  image: string;
  title: string;
  onClick?: () => void;
}

const getImageUrl = (image: string) => {
  if (!image) return '';
  return image.startsWith('http') ? image : `${BACKEND_URL}${image}`;
};

const SectionCard: React.FC<SectionCardProps> = ({
  image,
  title,
  onClick,
}) => (
  <div
    className="flex flex-col items-center cursor-pointer rounded-xl shadow-lg p-3 transition hover:shadow-2xl"
    onClick={onClick}
    style={{
      minWidth: 140,
      maxWidth: 200,
      background: "#fff", // changed to white
      boxShadow: "0 4px 16px 0 rgba(40, 40, 80, 0.18)",
    }}
  >
    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden mb-2 shadow-sm">
      <img
        src={getImageUrl(image)}
        alt={title}
        className="object-contain w-full h-full"
        loading="lazy"
        onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
      />
    </div>
    <div className="text-center">
      <div className="font-semibold text-gray-900 text-base leading-tight">{title}</div>
    </div>
  </div>
);

export default SectionCard;
