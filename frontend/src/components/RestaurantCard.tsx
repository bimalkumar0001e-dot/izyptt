import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '@/types/product';
import { Clock, Star } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const UPLOADS_BASE = BACKEND_URL;

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Ensure image is always a valid URL
  let imageUrl = restaurant.image || '';
  if (
    imageUrl.startsWith('/uploads') ||
    imageUrl.startsWith('/restaurant_delv images')
  ) {
    imageUrl = `${UPLOADS_BASE}${imageUrl}`;
  }

  return (
    <div 
      className="relative cursor-pointer"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={restaurant.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
          <h3 className="text-white font-semibold">{restaurant.name}</h3>
          <p className="text-white text-xs opacity-90">{restaurant.categories.join(' • ')}</p>
        </div>
      </div>
      <div className="p-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-green-100 px-2 py-0.5 rounded">
            <Star className="w-3 h-3 text-green-600 fill-green-600 mr-1" />
            <span className="text-sm font-medium text-green-600">{restaurant.rating}</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="w-3 h-3 mr-1" />
            <span>{restaurant.deliveryTime} min</span>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          ₹{restaurant.minOrder} min
        </div>
      </div>
      {/* Heart icon removed */}
    </div>
  );
};
