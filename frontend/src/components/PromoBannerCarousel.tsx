import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import PromoBanner from './PromoBanner';

interface Banner {
  _id: string;
  image?: string;
}

const PromoBannerCarousel: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <Swiper
      modules={[Autoplay]}
      slidesPerView={1}
      loop
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      className="w-full"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner._id}>
          <PromoBanner image={banner.image} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PromoBannerCarousel;