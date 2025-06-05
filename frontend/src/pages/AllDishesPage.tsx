import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const UPLOADS_BASE = BACKEND_URL;

const AllDishesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/customer/products`);
        let data = await res.json();
        // Only include products with a valid restaurant id
        data = data
          .filter((p: any) => !!p.restaurant)
          .map((p: any) => {
            let img = p.image || "";
            if (img.startsWith("/uploads")) img = `${UPLOADS_BASE}${img}`;
            else if (img && !img.startsWith("http")) img = `${UPLOADS_BASE}/uploads/${img.replace("uploads/", "")}`;
            else if (!img) img = `${UPLOADS_BASE}/uploads/default-food.jpg`;
            return { ...p, image: img };
          });
        setProducts(data);
        filterProducts(initialQuery, data);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const filterProducts = (query: string, productsList = products) => {
    if (!query.trim()) {
      setFilteredProducts(productsList);
      return;
    }
    const filtered = productsList.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterProducts(searchQuery);
    navigate(`/all-dishes?q=${encodeURIComponent(searchQuery)}`, { replace: true });
  };

  useEffect(() => {
    filterProducts(searchQuery);
    // eslint-disable-next-line
  }, [products]);

  return (
    <div className="app-container">
      <AppHeader title="All Dishes" showBackButton showCart />
      <div className="flex-1 pb-16">
        <form onSubmit={handleSearch} className="p-4 sticky top-0 bg-white z-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 app-input"
              />
            </div>
            <Button type="submit" className="bg-app-primary hover:bg-app-accent">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </form>
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">All Dishes ({filteredProducts.length})</h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={{
                    ...product,
                    id: product._id || product.id,
                    restaurant: product.restaurantName || product.restaurant || "Restaurant",
                  }}
                />
              ))}
            </div>
          )}
          {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                src="/placeholder.svg"
                alt="No Results"
                className="w-16 h-16 mb-2 opacity-50"
              />
              <p className="text-lg font-medium text-gray-700">No dishes found</p>
              <p className="text-gray-500 text-center mt-1">
                Try searching with different keywords
              </p>
              {searchQuery && (
                <Button
                  variant="link"
                  className="mt-4 text-app-primary"
                  onClick={() => {
                    setSearchQuery("");
                    filterProducts("");
                    navigate("/all-dishes", { replace: true });
                  }}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AllDishesPage;