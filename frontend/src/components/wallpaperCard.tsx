import React from "react";

interface WallpaperCardProps {
  image: string;
  alt?: string;
  className?: string;
}

const WallpaperCard: React.FC<WallpaperCardProps> = ({ image, alt = "Wallpaper", className = "" }) => (
  <div
    className={`bg-[#E9EAEC] rounded-2xl overflow-hidden w-full h-full flex items-center justify-center ${className}`}
    style={{ aspectRatio: "16/9", minHeight: 180, minWidth: 320 }}
  >
    {image ? (
      <img
        src={image}
        alt={alt}
        className="object-cover w-full h-full"
        style={{ borderRadius: "inherit" }}
      />
    ) : null}
  </div>
);

export default WallpaperCard;
