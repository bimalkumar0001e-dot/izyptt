import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Star, ChevronRight, Tag, Smile, X } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { RestaurantCard } from '@/components/RestaurantCard';
import { ProductCard } from '@/components/ProductCard';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import PromoOfferCarousel from '@/components/PromoOfferCarousel';
import PromoBannerCarousel from '@/components/PromoBannerCarousel';
import ServiceCard from '@/components/ServiceCard';
import { serviceTypes } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import SectionCard from '@/components/SectionCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const UPLOADS_BASE = BACKEND_URL;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // State for fetched data
  const [popularRestaurants, setPopularRestaurants] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [popularDishes, setPopularDishes] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [showAllPopular, setShowAllPopular] = useState(false);
  const [popularDishesToShow, setPopularDishesToShow] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  // State for showing coming soon page
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [siteStatus, setSiteStatus] = useState<string>('online');
  const [statusLoading, setStatusLoading] = useState(true);
  const [sectionProductIndices, setSectionProductIndices] = useState<{ [sectionId: string]: number }>({});
  const [sectionProductOrders, setSectionProductOrders] = useState<{ [sectionId: string]: any[] }>({});
  const [popularDishesOrder, setPopularDishesOrder] = useState<any[]>([]);

  useEffect(() => {
    // Redirect if not authenticated or blocked/inactive
    if (isLoading) return; // Wait until loading is done
    if (!isAuthenticated || (user && (String(user.status) === 'inactive' || String(user.status) === 'blocked'))) {
      navigate('/login');
      return;
    }

    // Fetch data from backend
    const fetchData = async () => {
      setLoading(true);
      let restaurantMap: Record<string, string> = {};
      try {
        // Fetch all restaurants (for mapping restaurant names to products/dishes)
        const resRestaurants = await fetch(`${API_BASE}/customer/restaurants`);
        const dataRestaurants = await resRestaurants.json();
        restaurantMap = {};
        dataRestaurants.forEach((r: any) => {
          restaurantMap[r._id] = r.name;
        });

        // Fetch all products (for other sections/search)
        const resProducts = await fetch(`${API_BASE}/customer/products`);
        let dataProducts = await resProducts.json();
        dataProducts = dataProducts.map((p: any) => {
          const updatedProduct = {
            ...p,
            restaurantName: p.restaurant && restaurantMap[p.restaurant]
              ? restaurantMap[p.restaurant]
              : 'Unknown Restaurant'
          };
          if (p.image && typeof p.image === 'string') {
            if (p.image.startsWith('/uploads')) {
              updatedProduct.image = `${UPLOADS_BASE}${p.image}`;
            } else if (!p.image.startsWith('http')) {
              updatedProduct.image = `${UPLOADS_BASE}/uploads/${p.image.replace('uploads/', '')}`;
            }
          } else {
            updatedProduct.image = `${UPLOADS_BASE}/uploads/default-food.jpg`;
          }
          return updatedProduct;
        });
        setProducts(dataProducts || []);

        // Extract unique categories from products
        const uniqueCategories = Array.from(
          new Set((dataProducts || []).map((p: any) => p.category).filter(Boolean))
        );
        setCategories(uniqueCategories as string[]);

        // Fetch only popular dishes
        const resPopular = await fetch(`${API_BASE}/admin/popular-dishes`);
        let dataPopular = await resPopular.json();
        dataPopular = dataPopular.map((p: any) => {
          const updatedProduct = {
            ...p,
            restaurantName: p.restaurant && restaurantMap[p.restaurant]
              ? restaurantMap[p.restaurant]
              : 'Unknown Restaurant'
          };
          if (p.image && typeof p.image === 'string') {
            if (p.image.startsWith('/uploads')) {
              updatedProduct.image = `${UPLOADS_BASE}${p.image}`;
            } else if (!p.image.startsWith('http')) {
              updatedProduct.image = `${UPLOADS_BASE}/uploads/${p.image.replace('uploads/', '')}`;
            }
          } else {
            updatedProduct.image = `${UPLOADS_BASE}/uploads/default-food.jpg`;
          }
          return updatedProduct;
        });
        setPopularDishes(dataPopular || []);

        // Fetch only popular restaurants (for Popular Restaurants section)
        const resPopularRestaurants = await fetch(`${API_BASE}/admin/popular-restaurants`);
        let dataPopularRestaurants = await resPopularRestaurants.json();
        dataPopularRestaurants = dataPopularRestaurants.map((r: any) => ({
          ...r,
          image:
            r.restaurantDetails?.image
              ? (r.restaurantDetails.image.startsWith('/uploads') || r.restaurantDetails.image.startsWith('/restaurant_delv images')
                  ? `${UPLOADS_BASE}${r.restaurantDetails.image}`
                  : r.restaurantDetails.image)
              : (r.image || '')
        }));
        setPopularRestaurants(dataPopularRestaurants || []);

        // Fetch sections and normalize products inside each section
        const resSections = await fetch(`${API_BASE}/customer/sections`);
        let dataSections = await resSections.json();
        dataSections = (dataSections || []).map((section: any) => ({
          ...section,
          products: (section.products || []).map((p: any) => {
            let restaurantName = p.restaurant && restaurantMap[p.restaurant]
              ? restaurantMap[p.restaurant]
              : 'Unknown Restaurant';
            if (restaurantName === 'Unknown Restaurant' && p.description) {
              restaurantName = p.description;
            }
            const updatedProduct = {
              ...p,
              restaurantName
            };
            if (p.image && typeof p.image === 'string') {
              if (p.image.startsWith('/uploads')) {
                updatedProduct.image = `${UPLOADS_BASE}${p.image}`;
              } else if (!p.image.startsWith('http')) {
                updatedProduct.image = `${UPLOADS_BASE}/uploads/${p.image.replace('uploads/', '')}`;
              }
            } else {
              updatedProduct.image = `${UPLOADS_BASE}/uploads/default-food.jpg`;
            }
            return updatedProduct;
          })
        }));
        setSections(dataSections);
      } catch (err) {
        setPopularRestaurants([]);
        setProducts([]);
        setPopularDishes([]);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/banners`);
        const data = await res.json();
        setBanners(
          data
            .filter((b: any) => b.isActive)
            .map((b: any) => ({
              ...b,
              image: b.image && b.image.startsWith('http')
                ? b.image
                : `${UPLOADS_BASE}${b.image}`
            }))
        );
      } catch {
        setBanners([]);
      }
    };

    fetchData();
    fetchBanners();

    // Fetch delivered orders for 'Order Again'
    const fetchDeliveredOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/customer/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        // Only delivered orders
        const delivered = (data || []).filter((order: any) => (order.status || '').toLowerCase() === 'delivered');
        setDeliveredOrders(delivered);
      } catch (err) {
        setDeliveredOrders([]);
      }
    };
    fetchDeliveredOrders();

    // Fetch site status on mount
    const fetchSiteStatus = async () => {
      setStatusLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/system-status`);
        const data = await res.json();
        setSiteStatus(data.status || 'online');
      } catch {
        setSiteStatus('online');
      } finally {
        setStatusLoading(false);
      }
    };
    fetchSiteStatus();
  }, [isAuthenticated, user, navigate, isLoading]);

  useEffect(() => {
    // Initialize indices when sections change
    if (sections.length > 0) {
      const initialIndices: { [sectionId: string]: number } = {};
      sections.forEach(section => {
        initialIndices[section._id] = 0;
      });
      setSectionProductIndices(initialIndices);
    }
  }, [sections]);

  useEffect(() => {
    // Initialize product orders when sections change
    if (sections.length > 0) {
      const initialOrders: { [sectionId: string]: any[] } = {};
      sections.forEach(section => {
        initialOrders[section._id] = section.products ? [...section.products] : [];
      });
      setSectionProductOrders(initialOrders);
    }
  }, [sections]);

  useEffect(() => {
    if (sections.length === 0) return;
    const interval = setInterval(() => {
      setSectionProductOrders(prev => {
        const updated: { [sectionId: string]: any[] } = { ...prev };
        sections.forEach(section => {
          const arr = prev[section._id] || [];
          if (arr.length > 1) {
            // Shift left: first element moves to end
            updated[section._id] = [...arr.slice(1), arr[0]];
          }
        });
        return updated;
      });
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [sections]);

  useEffect(() => {
    setPopularDishesOrder(popularDishes);
  }, [popularDishes]);

  useEffect(() => {
    if (!popularDishesOrder || popularDishesOrder.length <= 1) return;
    const interval = setInterval(() => {
      setPopularDishesOrder(prev => prev.length > 1 ? [...prev.slice(1), prev[0]] : prev);
    }, 30000);
    return () => clearInterval(interval);
  }, [popularDishesOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handler for 'See All' popular dishes
  const handleSeeAllPopular = () => {
    navigate('/all-dishes?popular=1');
  };

  // Handler for clicking a category card
  const handleCategoryClick = (category: string) => {
    navigate(`/all-dishes?q=${encodeURIComponent(category)}`);
  };

  // Handler for service card click
  const handleServiceClick = (type: string) => {
    if (type === 'pickup') {
      navigate('/pickup-drop');
    } else {
      setShowComingSoon(true);
    }
  };

  // Handler for section card click - updated to show modal instead of navigating
  const handleSectionClick = (section: any) => {
    setSelectedSection(section);
    setShowSectionModal(true);
  };

  // Add a helper to check if site is disabled
  const isSiteDisabled = siteStatus === 'offline' || siteStatus === 'maintenance';

  // Show loading spinner while auth or status is loading
  if (isLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    );
  }

  // Helper to filter veg/non-veg
  const nonVegCategories = ['non-veg', 'nonveg', 'non vegetarian', 'nonvegetarian'];
  const nonVegDishes = popularDishesOrder.filter(
    (item) =>
      typeof item.category === 'string' &&
      nonVegCategories.includes(item.category.trim().toLowerCase())
  );
  const vegDishes = popularDishesOrder.filter(
    (item) =>
      typeof item.category === 'string' &&
      !nonVegCategories.includes(item.category.trim().toLowerCase())
  );

  return (
    <div className="app-container bg-gray-50">
      {/* Maintenance/Offline Banner - always visible on all devices */}
      {/* REMOVE the following block to remove the uppermost offline message */}
      {/*
      {isSiteDisabled && (
        <div className="w-full px-2 py-2 bg-yellow-400 text-center text-sm md:text-base font-semibold text-gray-900 z-50 shadow-md fixed top-0 left-0 right-0" style={{letterSpacing: 0.5, lineHeight: 1.3}}>
          {siteStatus === 'maintenance' ? 'The site is currently under maintenance. Some features may be unavailable.' : 'The site is currently offline. Please check back later.'}
        </div>
      )}
      */}
      {/* Add top margin if banner is visible */}
      <div>
        <AppHeader showCart />
        <div className="flex-1 pb-20">
          {/* Header with Search Bar */}
          <div className="p-4 bg-gradient-to-r from-app-primary to-app-accent text-white rounded-b-lg shadow-md">
            <div className="flex items-center mb-3">
              <MapPin className="w-5 h-5 mr-2" />
              <p className="text-sm font-medium">Deliver to: <span className="font-bold">{user?.address?.[0]?.city || 'Sb Pur, Bihar'}</span></p>
            </div>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for food, groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white text-gray-900 border-0 h-11 rounded-lg shadow-sm"
                disabled={isSiteDisabled}
              />
              <Button
                type="submit"
                className="bg-white text-app-primary hover:bg-gray-100 h-11 w-11 px-0 flex items-center justify-center rounded-lg shadow-sm"
                disabled={isSiteDisabled}
              >
                <Search className="w-5 h-5" />
              </Button>
            </form>
            {/* Site status message */}
            {isSiteDisabled && (
              <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-center font-semibold text-base">
                {siteStatus === 'offline'
                  ? 'We are Offline, not accepting orders currently. Please check back later!'
                  : 'Maintenance Mode: We are performing scheduled maintenance. Please try again soon.'}
              </div>
            )}
          </div>

          {/* Promo offer Carousel */}
          <div className="px-4 py-3">
            <PromoOfferCarousel />
          </div>

          {/* Services */}
          <div className="p-4 bg-white rounded-xl shadow-sm mx-4 -mt-2">
            <h2 className="font-medium text-sm text-gray-500 mb-2">What do you need today?</h2>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <div className="grid grid-cols-4 gap-3">
              <ServiceCard
                type="pickup"
                name="Pick & Drop"
                colorClass={serviceTypes.pickup.color}
                onClick={() => !isSiteDisabled && handleServiceClick('pickup')}
              />
              <ServiceCard
                type="groceries"
                name="Buy Groceries"
                colorClass={serviceTypes.groceries.color}
                onClick={() => !isSiteDisabled && handleServiceClick('groceries')}
              />
              <ServiceCard
                type="party"
                name="Party"
                colorClass={serviceTypes.food.color}
                onClick={() => !isSiteDisabled && handleServiceClick('party')}
              />
              <ServiceCard
                type="scrap"
                name="Sell Scrap"
                colorClass={serviceTypes.scrap.color}
                onClick={() => !isSiteDisabled && handleServiceClick('scrap')}
              />
            </div>
          </div>

          {/* Show Coming Soon Page if needed */}
          {showComingSoon && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
                <ComingSoonPage />
                <button
                  className="mt-6 px-6 py-2 rounded-lg bg-app-primary text-white font-semibold shadow hover:bg-app-accent transition"
                  onClick={() => setShowComingSoon(false)}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          {/* Banner Section with carousel */}
          <div className="mx-4 mt-4 rounded-2xl border border-app-primary/40 shadow-sm overflow-hidden">
            <PromoBannerCarousel banners={banners} />
          </div>
          
          {/* Popular Dishes - Veg & Non Veg Sections */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-lg text-gray-800">Popular Dishes</h2>
              <span className="bg-app-primary/10 text-app-primary text-xs px-2 py-1 rounded-full">Trending</span>
            </div>
            {/* Veg Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base text-green-700">Vegetarian Favorites</span>
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((item) => (
                    <Card key={item} className="overflow-hidden">
                      <div className="h-32 bg-gray-200 animate-pulse"></div>
                      <CardContent className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                  {vegDishes.length === 0 ? (
                    <div className="text-gray-500 flex items-center justify-center h-32 px-4">
                      <p>No veg dishes available right now.</p>
                    </div>
                  ) : (
                    vegDishes.map((item) => (
                      <div key={item._id} className="min-w-[180px] max-w-[220px]">
                        <ProductCard
                          product={{
                            ...item,
                            id: item._id,
                            restaurant: item.restaurantName
                          }}
                          hideAddToCart={isSiteDisabled}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Non Veg Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-base text-red-700">Signature Non-Veg Delights</span>
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((item) => (
                    <Card key={item} className="overflow-hidden">
                      <div className="h-32 bg-gray-200 animate-pulse"></div>
                      <CardContent className="p-3 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
                  {nonVegDishes.length === 0 ? (
                    <div className="text-gray-500 flex items-center justify-center h-32 px-4">
                      <p>No non veg dishes available right now.</p>
                    </div>
                  ) : (
                    nonVegDishes.map((item) => (
                      <div key={item._id} className="min-w-[180px] max-w-[220px]">
                        <ProductCard
                          product={{
                            ...item,
                            id: item._id,
                            restaurant: item.restaurantName
                          }}
                          hideAddToCart={isSiteDisabled}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          {/* --- END POPULAR DISHES SECTION --- */}

          {/* Categories Section */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-gray-800">Categories</h2>
                <span className="bg-app-primary/10 text-app-primary text-xs px-2 py-1 rounded-full">Explore</span>
              </div>
            </div>
            {/* Horizontally scrollable sections slider */}
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar" style={{ scrollbarWidth: 'none', borderBottom: 'none', boxShadow: 'none' }}>
              {sections.map(section => {
                let imageUrl = section.image;
                if (imageUrl && typeof imageUrl === 'string') {
                  if (imageUrl.startsWith('/uploads')) {
                    imageUrl = `${UPLOADS_BASE}${imageUrl}`;
                  } else if (!imageUrl.startsWith('http')) {
                    imageUrl = `${UPLOADS_BASE}/uploads/${imageUrl.replace('uploads/', '')}`;
                  }
                } else {
                  imageUrl = '/placeholder.svg';
                }
                return (
                  <SectionCard
                    key={section._id}
                    image={imageUrl}
                    title={section.name}
                    onClick={() => handleSectionClick(section)}
                  />
                );
              })}
            </div>
          </div>

          {/* Sections (after popular dishes) */}
          {sections.map(section => (
            <div key={section._id} className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-800">{section.name}</h2>
                <span className="text-xs text-gray-500">{section.products.length} product{section.products.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Hide scrollbar for Webkit browsers */}
                <style>{`
                  .no-scrollbar::-webkit-scrollbar { display: none; }
                `}</style>
                {section.products.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No products in this section.</div>
                ) : (
                  (sectionProductOrders[section._id] || section.products).map((product: any) => (
                    <div key={product._id} className="min-w-[180px] max-w-[220px]">
                      <ProductCard
                        product={{
                          ...product,
                          id: product._id,
                          restaurant: product.restaurantName || product.restaurant || ''
                        }}
                        hideAddToCart={isSiteDisabled}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          {/* Separator with style */}
          <div className="px-4">
            <Separator className="h-0.5 bg-gradient-to-r from-gray-200 via-app-primary/30 to-gray-200 my-4" />
          </div>

          {/* Recent Orders Quick Access */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-app-primary" />
              <h2 className="font-bold text-lg text-gray-800">Order Again</h2>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
              {deliveredOrders.length === 0 ? (
                <div className="text-gray-400 flex items-center justify-center h-24 px-4">No delivered orders yet.</div>
              ) : (
                deliveredOrders.map((order, idx) => (
                  <Card
                    key={order.id || order._id || idx}
                    className="min-w-[150px] border-none shadow-sm transition"
                  >
                    <div className="h-20 bg-gray-100 flex items-center justify-center">
                      {order.items && order.items[0] && (
                        <img
                          src={(() => {
                            let imgSrc = order.items[0].image || order.items[0].product?.image || '/placeholder.png';
                            if (imgSrc && typeof imgSrc === 'string' && imgSrc.startsWith('/uploads')) {
                              imgSrc = `${UPLOADS_BASE}${imgSrc}`;
                            }
                            return imgSrc;
                          })()}
                          alt={order.items[0].name}
                          className="w-12 h-12 rounded object-cover border"
                          style={{ minWidth: 48, minHeight: 48 }}
                          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                        />
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{order.items && order.items[0] ? order.items[0].name : 'Order'}</p>
                      <p className="text-xs text-gray-500">Delivered</p>
                    </CardContent>
                  </Card>
                ))
              )}
              <Card className="min-w-[150px] border-dashed border-gray-300 bg-gray-50">
                <CardContent className="h-full flex items-center justify-center p-3">
                  <p className="text-sm text-gray-500 text-center">View Order History</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Section Products Modal */}
        <Dialog open={showSectionModal} onOpenChange={setShowSectionModal}>
          <DialogContent className="sm:max-w-[90%] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-xl font-bold">{selectedSection?.name || "Section Products"}</DialogTitle>
                <button 
                  onClick={() => setShowSectionModal(false)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DialogHeader>
            
            {selectedSection && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                    <img 
                      src={
                        selectedSection.image 
                          ? (selectedSection.image.startsWith('/uploads') 
                              ? `${UPLOADS_BASE}${selectedSection.image}` 
                              : selectedSection.image)
                          : '/placeholder.svg'
                      }
                      alt={selectedSection.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{selectedSection.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedSection.products?.length || 0} product{selectedSection.products?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {(selectedSection.products || []).length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500">
                      No products available in this section.
                    </div>
                  ) : (
                    (selectedSection.products || []).map((product: any) => (
                      <ProductCard
                        key={product._id}
                        product={{
                          ...product,
                          id: product._id,
                          restaurant: product.restaurantName || product.restaurant || ''
                        }}
                        hideAddToCart={true}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        <BottomNav />
      </div>
    </div>
  );
};

const ComingSoonPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="mb-6">
      <span className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-app-primary to-app-accent shadow-lg">
        <Smile className="w-16 h-16 text-white" />
      </span>
    </div>
    <h1 className="text-3xl font-bold mb-2 text-app-primary">Coming Soon!</h1>
    <p className="text-lg text-gray-600">This service will be available soon. Stay tuned!</p>
  </div>
);

export default Home;