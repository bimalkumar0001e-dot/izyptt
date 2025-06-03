import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const API_BASE = "http://localhost:5001/api";
const UPLOADS_BASE = "http://localhost:5001";

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sectionResults, setSectionResults] = useState<any[]>([]);
  const [showSectionProducts, setShowSectionProducts] = useState(false);
  const [sectionProducts, setSectionProducts] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
    if (initialQuery) performSearch(initialQuery);
  }, [initialQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setShowSectionProducts(false);
    setSectionResults([]);
    setSectionProducts([]);
    setSelectedSection(null);

    if (!query.trim()) {
      setSearchResults([]);
      setSectionResults([]);
      setSectionProducts([]);
      setShowSectionProducts(false);
      setSelectedSection(null);
      setLoading(false);
      return;
    }

    // Search products
    let products: any[] = [];
    try {
      const res = await fetch(`${API_BASE}/customer/products/search?q=${encodeURIComponent(query)}`);
      products = await res.json();
      products = (products || []).map((p: any) => {
        let img = p.image || "";
        if (img.startsWith("/uploads")) img = `${UPLOADS_BASE}${img}`;
        else if (img && !img.startsWith("http")) img = `${UPLOADS_BASE}/uploads/${img.replace("uploads/", "")}`;
        else if (!img) img = `${UPLOADS_BASE}/uploads/default-food.jpg`;
        return { ...p, image: img, id: p._id };
      });
    } catch {
      products = [];
    }
    setSearchResults(products);

    // Search sections (categories)
    let sections: any[] = [];
    try {
      const res = await fetch(`${API_BASE}/customer/sections/search?q=${encodeURIComponent(query)}`);
      sections = await res.json();
      sections = (sections || []).map((s: any) => {
        let img = s.image || "";
        if (img.startsWith("/uploads")) img = `${UPLOADS_BASE}${img}`;
        else if (img && !img.startsWith("http")) img = `${UPLOADS_BASE}/uploads/${img.replace("uploads/", "")}`;
        else if (!img) img = `${UPLOADS_BASE}/uploads/default-food.jpg`;
        return { ...s, image: img, id: s._id };
      });
    } catch {
      sections = [];
    }
    setSectionResults(sections);

    // Add to recent searches
    if (!recentSearches.includes(query)) {
      const updatedSearches = [query, ...recentSearches].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // When a section is clicked, show all products in that section
  const handleSectionClick = (section: any) => {
    setSelectedSection(section);
    setSectionProducts(
      (section.products || []).map((p: any) => {
        let img = p.image || "";
        if (img.startsWith("/uploads")) img = `${UPLOADS_BASE}${img}`;
        else if (img && !img.startsWith("http")) img = `${UPLOADS_BASE}/uploads/${img.replace("uploads/", "")}`;
        else if (!img) img = `${UPLOADS_BASE}/uploads/default-food.jpg`;
        return { ...p, image: img, id: p._id };
      })
    );
    setShowSectionProducts(true);
  };

  return (
    <div className="app-container">
      <AppHeader title="Search" />
      <div className="flex-1 pb-16">
        <form onSubmit={handleSearch} className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for food, groceries, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 app-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
        {loading ? (
          <div className="p-4 text-center text-gray-400">Searching...</div>
        ) : showSectionProducts && selectedSection ? (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <img src={selectedSection.image} alt={selectedSection.name} className="w-12 h-12 rounded object-cover" />
              <div>
                <h2 className="font-bold text-lg">{selectedSection.name}</h2>
                <p className="text-gray-500 text-sm">{selectedSection.description}</p>
              </div>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setShowSectionProducts(false)}>
                Back
              </Button>
            </div>
            {sectionProducts.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No products in this section.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sectionProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ) : searchQuery && (searchResults.length > 0 || sectionResults.length > 0) ? (
          <div className="p-4">
            {sectionResults.length > 0 && (
              <>
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="flex gap-3 mb-4 overflow-x-auto">
                  {sectionResults.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section)}
                      className="flex flex-col items-center bg-gray-50 rounded-lg p-3 shadow hover:bg-gray-100 min-w-[100px]"
                    >
                      <img src={section.image} alt={section.name} className="w-12 h-12 rounded object-cover mb-1" />
                      <span className="text-sm font-medium">{section.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {searchResults.length > 0 && (
              <>
                <h3 className="font-semibold mb-3">{searchResults.length} Results</h3>
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
            {searchResults.length === 0 && sectionResults.length === 0 && (
              <div className="text-gray-500 text-center py-8">No results found.</div>
            )}
          </div>
        ) : initialQuery ? (
          <div className="p-4 flex flex-col items-center justify-center">
            <img 
              src="https://img.icons8.com/pastel-glyph/64/000000/search--v2.png"
              alt="No Results"
              className="w-16 h-16 mb-2 opacity-50"
            />
            <p className="text-lg font-medium text-gray-700">No results found</p>
            <p className="text-gray-500 text-center mt-1">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="p-4">
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Recent Searches</h3>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-sm text-app-primary"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(query)}
                      className="flex items-center p-3 w-full text-left bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{query}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="font-medium mb-2">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Bihari', 'North Indian', 'Street Food', 'Desserts', 'Staples', 'Dairy', 'Daily'].map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSearchQuery(category);
                      performSearch(category);
                    }}
                    className="px-3 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default SearchPage;
