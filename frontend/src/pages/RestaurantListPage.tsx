import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const UPLOADS_BASE = BACKEND_URL;

const RestaurantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch all restaurants from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/customer/restaurants`);
        let data = await res.json();
        // Fix image path
        data = data.map((r: any) => ({
          ...r,
          image: r.image?.startsWith('/uploads')
            ? `${UPLOADS_BASE}${r.image}`
            : r.image
        }));
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch {
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Get all unique categories from restaurants
  const allCategories = Array.from(
    new Set(restaurants.flatMap(restaurant => restaurant.categories || []))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setCategoryFilters(prev => [...prev, category]);
    } else {
      setCategoryFilters(prev => prev.filter(c => c !== category));
    }
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating === minRating ? null : rating);
  };

  const applyFilters = () => {
    let results = [...restaurants];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        restaurant =>
          restaurant.name.toLowerCase().includes(query) ||
          (restaurant.categories || []).some((cat: string) => cat.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    if (categoryFilters.length > 0) {
      results = results.filter(
        restaurant =>
          (restaurant.categories || []).some((cat: string) => categoryFilters.includes(cat))
      );
    }

    // Apply rating filter
    if (minRating !== null) {
      results = results.filter(restaurant => restaurant.rating >= minRating);
    }

    // Apply sorting
    if (sortBy === 'rating') {
      results = [...results].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'delivery') {
      results = [...results].sort((a, b) =>
        parseInt(a.deliveryTime) - parseInt(b.deliveryTime)
      );
    }

    setFilteredRestaurants(results);
  };

  const resetFilters = () => {
    setCategoryFilters([]);
    setMinRating(null);
    setSortBy('');
    setSearchQuery('');
    setFilteredRestaurants(restaurants);
  };

  return (
    <div className="app-container">
      <AppHeader title="Restaurants" showBackButton showCart />

      <div className="flex-1 pb-20">
        <div className="p-4 border-b bg-white">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              placeholder="Search restaurants"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-app-primary" size="icon">
              <Search className="h-4 w-4" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Restaurants</SheetTitle>
                </SheetHeader>

                <div className="py-4">
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    {allCategories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={categoryFilters.includes(category)}
                          onCheckedChange={(checked) =>
                            handleCategoryChange(category, checked === true)
                          }
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <h3 className="font-medium mb-3">Rating</h3>
                  <div className="flex justify-between">
                    {[4, 3, 2].map((rating) => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRatingChange(rating)}
                      >
                        {rating}+ ⭐
                      </Button>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <h3 className="font-medium mb-3">Sort By</h3>
                  <div className="flex justify-between">
                    <Button
                      variant={sortBy === 'rating' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('rating')}
                    >
                      Rating
                    </Button>
                    <Button
                      variant={sortBy === 'delivery' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('delivery')}
                    >
                      Delivery Time
                    </Button>
                  </div>

                  <div className="mt-8 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={resetFilters}
                    >
                      Reset
                    </Button>
                    <Button
                      className="flex-1 bg-app-primary"
                      onClick={() => {
                        applyFilters();
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </form>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={{
                  id: restaurant._id,
                  name: restaurant.name,
                  image: restaurant.image,
                  rating: restaurant.rating,
                  deliveryTime: restaurant.deliveryTime,
                  minOrder: restaurant.minOrder,
                  categories: restaurant.categories || [],
                  address: restaurant.address,
                }}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No restaurants found matching your criteria</p>
              <Button
                variant="link"
                onClick={resetFilters}
                className="text-app-primary mt-2"
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default RestaurantListPage;