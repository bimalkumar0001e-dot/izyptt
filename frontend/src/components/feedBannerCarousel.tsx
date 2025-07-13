import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';

interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
  backgroundColor: string;
}

const FeedBannerCarousel: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView={1}
      loop
      autoplay={{ delay: 3500, disableOnInteraction: false }}
      className="w-full"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          <div className={`relative h-48 ${banner.backgroundColor} flex items-center justify-center text-white rounded-xl`}>
            <div className="text-center p-4">
              <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
              <p className="text-sm opacity-90">{banner.description}</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default FeedBannerCarousel;
