import React from "react";

interface SectionCardProps {
  image: string;
  title: string;
  onClick?: () => void;
}

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
      background: "#23243a", // solid shiny dark color
      boxShadow: "0 4px 16px 0 rgba(40, 40, 80, 0.18)",
    }}
  >
    <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden mb-2 shadow-sm">
      <img
        src={image}
        alt={title}
        className="object-contain w-full h-full"
        loading="lazy"
        onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
      />
    </div>
    <div className="text-center">
      <div className="font-semibold text-white text-base leading-tight">{title}</div>
    </div>
  </div>
);

export default SectionCard;
