import React, { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import PromoOffer from './PromoOffer';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

interface Offer {
  id?: string;
  _id?: string;
  title: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
}

const COLORS = [
  'bg-green-600',
  'bg-blue-600',
  'bg-orange-600',
];

const TEXT_COLORS = [
  'text-white',
  'text-white',
  'text-white',
  'text-white',
];

const PromoOfferCarousel: React.FC = () => {
  const [api, setApi] = useState<any>();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch offers from backend (admin endpoint)
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/admin/offers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter only active offers
          const activeOffers = (data || []).filter((offer: Offer) => offer.isActive);
          setOffers(activeOffers);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Auto rotate the carousel
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [api]);

  // If no offers or still loading, show nothing
  if (loading) {
    return <div className="h-20 flex items-center justify-center">Loading offers...</div>;
  }

  if (offers.length === 0) {
    return null; // Don't show carousel if no offers available
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
      setApi={setApi}
    >
      <CarouselContent>
        {offers.map((offer, idx) => (
          <CarouselItem key={offer.id || offer._id}>
            <PromoOffer
              title={offer.title}
              description={offer.description}
              backgroundColor={COLORS[idx % COLORS.length]}
              textColor={TEXT_COLORS[idx % TEXT_COLORS.length]}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 bg-white/80" />
      <CarouselNext className="right-2 top-1/2 -translate-y-1/2 bg-white/80" />
    </Carousel>
  );
};

export default PromoOfferCarousel;
