import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Star, ArrowLeft, Heart, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const UPLOADS_BASE = BACKEND_URL;

const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { user, isAuthenticated } = useAuth();
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    // Fetch restaurant details by ID
    fetch(`${API_BASE}/customer/restaurants/${id}`)
      .then(res => res.json())
      .then((data) => {
        setRestaurant(data || null);
        // Set favourite state if user is loaded
        if (user && (user as any).favouriteRestaurants) {
          setIsFavourite((user as any).favouriteRestaurants.some((rid: string) => rid === data._id));
        }
      });
    // Fetch products for this restaurant
    fetch(`${API_BASE}/customer/restaurants/${id}/products`)
      .then(res => res.json())
      .then((data) => {
        const prods = (data || []).map((p: any) => {
          let img = p.image || "";
          if (img.startsWith("/uploads")) img = `${UPLOADS_BASE}${img}`;
          else if (img && !img.startsWith("http")) img = `${UPLOADS_BASE}/uploads/${img.replace("uploads/", "")}`;
          else if (!img) img = `${UPLOADS_BASE}/uploads/default-food.jpg`;
          return { ...p, image: img, id: p._id, restaurant: data?.name || "" };
        });
        setProducts(prods);
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line
  }, [id, user]);

  // Get unique categories from products
  const productCategories = products.length > 0
    ? ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
    : ['all'];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      if (isFavourite) {
        await axios.post(
          `${API_BASE}/customer/favourites/restaurant/deselect`,
          { restaurantId: restaurant.id || restaurant._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavourite(false);
      } else {
        await axios.post(
          `${API_BASE}/customer/favourites/restaurant/select`,
          { restaurantId: restaurant.id || restaurant._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavourite(true);
      }
      // Optionally: update user context with new favourites
    } catch {
      // Optionally: show toast error
    }
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-app-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading restaurant details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="app-container">
        <AppHeader title="Restaurant Not Found" showBackButton showCart />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Restaurant Not Found</h2>
            <p className="text-gray-500 mb-4">The restaurant you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/restaurants')} className="bg-app-primary">
              Browse Restaurants
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="relative h-56">
        <img
          src={
            restaurant.image && restaurant.image.startsWith('/uploads')
              ? `${UPLOADS_BASE}${restaurant.image}`
              : restaurant.image
                ? restaurant.image
                : restaurant.restaurantDetails?.image && restaurant.restaurantDetails.image.startsWith('/uploads')
                  ? `${UPLOADS_BASE}${restaurant.restaurantDetails.image}`
                  : restaurant.restaurantDetails?.image
                    ? restaurant.restaurantDetails.image
                    : '/placeholder.svg'
          }
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 flex flex-col justify-between p-4">
          <div className="flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center"
            >
              <ArrowLeft className="text-white" />
            </button>
            <button
              className="absolute top-3 right-3 z-10 bg-white/80 rounded-full p-2 shadow"
              onClick={handleToggleFavourite}
              aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
            >
              <Heart
                className={`w-7 h-7 ${isFavourite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
              />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white border-b">
        <h1 className="text-2xl font-bold mb-1">{restaurant.name}</h1>
        <p className="text-gray-600 text-base mb-2">{(restaurant.categories || []).join(' • ')}</p>
        <div className="flex items-center space-x-4 text-base">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="font-semibold">{restaurant.rating}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-gray-500 mr-1" />
            <span>{restaurant.deliveryTime} min</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-gray-500 mr-1" />
            <span>₹{restaurant.deliveryFee} delivery</span>
          </div>
        </div>
        <div className="mt-3 text-base text-gray-600">
          <p className="flex items-start">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
            <span>{restaurant.address}</span>
          </p>
        </div>
      </div>
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search menu items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="p-4 bg-white border-b overflow-x-auto">
        <div className="flex space-x-2">
          {productCategories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category
                  ? "bg-app-primary text-white font-semibold"
                  : "bg-white text-gray-800"
              }
            >
              {category === 'all' ? 'All Items' : category}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-4 pb-20">
        <h2 className="font-bold text-xl mb-3">Menu</h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No menu items found matching your search</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="text-app-primary mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default RestaurantDetailPage;

