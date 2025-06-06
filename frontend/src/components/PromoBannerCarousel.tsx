import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import PromoBanner from './PromoBanner';
import { BACKEND_URL } from '@/utils/utils';

interface Banner {
  _id: string;
  image?: string;
}

const getImageUrl = (image?: string) => {
  if (!image) return '';
  return image.startsWith('http') ? image : `${BACKEND_URL}${image}`;
};

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
          <PromoBanner image={getImageUrl(banner.image)} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default PromoBannerCarousel;