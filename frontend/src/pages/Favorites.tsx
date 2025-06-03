// this file is not in use currently



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const UPLOADS_BASE = BACKEND_URL;

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch favorite food items
  useEffect(() => {
    const fetchFavProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/customer/favourites/foods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('API Response:', res.data); // Debug: Log raw API response
        console.log('API Response type:', typeof res.data); // Debug: Check the type of response
        
        let data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) console.log('No favorite products found in API response');
        
        // Improved image handling and data normalization
        data = data.map((p: any) => {
          // Start with default values to ensure all required fields exist
          const formattedProduct = {
            id: p._id || p.id || '',
            _id: p._id || p.id || '',
            name: p.name || 'Unnamed Product',
            image: '/placeholder.svg', // Default placeholder
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
            discountedPrice: p.discountedPrice ? (typeof p.discountedPrice === 'number' ? 
              p.discountedPrice : parseFloat(p.discountedPrice) || 0) : undefined,
            restaurant: p.restaurant || '',
            restaurantName: p.restaurantName || p.restaurant || 'Restaurant',
            isVeg: p.isVeg,
            category: p.category || 'Other',
            description: p.description || '',
          };
          
          // Handle image URL construction with better error checking
          let image = p.image || '';
          if (!image) {
            formattedProduct.image = `${UPLOADS_BASE}/uploads/default-food.jpg`;
          } else if (image.startsWith('/uploads')) {
            formattedProduct.image = `${UPLOADS_BASE}${image}`;
          } else if (image.startsWith('http')) {
            formattedProduct.image = image; // Use as-is if it's already an absolute URL
          } else {
            // For any other case, assume it needs the uploads path
            formattedProduct.image = `${UPLOADS_BASE}/uploads/${image.replace(/^uploads\//, '')}`;
          }
          
          console.log('Transformed product:', formattedProduct); // Debug: Log transformed product
          return formattedProduct;
        });
        
        setFavoriteProducts(data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setFavoriteProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFavProducts();
  }, []);

  return (
    <div className="app-container">
      <AppHeader title="Favorites" showBackButton />
      <div className="flex-1 p-4 pb-20">
        <Tabs defaultValue="dishes" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="dishes" className="w-full">Food Items</TabsTrigger>
          </TabsList>
          <TabsContent value="dishes">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-app-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading your favorite items...</p>
              </div>
            ) : favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {favoriteProducts.map((product) => (
                  <div
                    key={product.id || product._id}
                    onClick={() => navigate(`/product/${product.id || product._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <ProductCard product={product} hideAddToCart={false} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No favorite food items yet</h3>
                <p className="text-gray-500 mt-1">Explore food items and add them to your favorites</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 text-app-primary font-medium"
                >
                  Explore Food Items
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Favorites;