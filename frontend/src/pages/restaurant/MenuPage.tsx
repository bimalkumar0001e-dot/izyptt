import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RestaurantBottomNav } from '@/components/restaurant/RestaurantBottomNav';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
// Remove hardcoded UPLOADS_BASE, use BACKEND_URL for images
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
};

const MenuPage: React.FC = () => {
  const { user, isAuthenticated, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if auth is finished loading AND we're definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    // Only redirect if we know the user is not a restaurant
    else if (!isLoading && user && user.role !== 'restaurant') {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    // Only fetch data if we have a token (even if not fully authenticated yet)
    const storedToken = localStorage.getItem('token') || token;
    if (!storedToken) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const freshToken = localStorage.getItem('token') || token;
        const res = await fetch(`${API_BASE}/restaurants/products`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${freshToken}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        
        // Process product images to ensure they have full URLs
        const processedData = data.map((item: any) => ({
          ...item,
          image: item.image ? getImageUrl(item.image) : null
        }));
        
        setProducts(processedData);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [isAuthenticated, token]);

  // Wait for auth to finish loading before rendering
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Only show placeholder while checking auth
  if (!isAuthenticated) {
    // Attempt to use localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'restaurant') {
          // Continue rendering if localStorage indicates user is a restaurant
          // The auth context will catch up shortly
        } else {
          return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
        }
      } catch {
        return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
      }
    } else {
      return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
    }
  }

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Manage Menu</h1>
      </header>
      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No menu items found.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {products.map((item) => (
              <Card key={item._id} className="overflow-hidden">
                {item.image && (
                  <div className="w-full h-40 bg-gray-100 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback on image load error
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                        console.log('Image failed to load:', item.image);
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold mb-1">₹{item.price}</div>
                  <div className="text-sm text-gray-600 mb-2">{item.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <RestaurantBottomNav />
    </div>
  );
};

export default MenuPage;
