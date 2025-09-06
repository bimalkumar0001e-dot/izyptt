import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { ProductCard } from "@/components/ProductCard";
import { BottomNav } from "@/components/BottomNav";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const AllProductsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sectionId = queryParams.get("section");

  const [products, setProducts] = useState<any[]>([]);
  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/customer/sections/${sectionId}/products`);
        const data = await res.json();
        setProducts(data.products || []);
        // Optionally fetch section name
        const sectionRes = await fetch(`${API_BASE}/admin/sections`);
        const sections = await sectionRes.json();
        const section = sections.find((s: any) => s._id === sectionId);
        setSectionName(section?.name || "Section");
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    if (sectionId) fetchSectionProducts();
  }, [sectionId]);

  return (
    <div className="app-container">
      <AppHeader title={sectionName ? `${sectionName} Products` : "Section Products"} showBackButton showCart />
      <div className="flex-1 pb-16">
        <div className="p-4">
          <h2 className="font-semibold text-lg mb-3">
            {sectionName} ({products.length} products)
          </h2>
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
              {products.map((product) => (
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
          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10">
              <img
                src="/placeholder.svg"
                alt="No Results"
                className="w-16 h-16 mb-2 opacity-50"
              />
              <p className="text-lg font-medium text-gray-700">No products found</p>
              <p className="text-gray-500 text-center mt-1">
                This section has no products.
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AllProductsPage;
