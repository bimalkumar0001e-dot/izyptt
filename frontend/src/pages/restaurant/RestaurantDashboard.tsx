import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Check, ArrowLeft, Bell, AlertCircle, Utensils, List, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantBottomNav } from '@/components/restaurant/RestaurantBottomNav'; // Uncomment if you have this component
import PromoBannerCarousel from '@/components/PromoBannerCarousel';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
// Remove hardcoded UPLOADS_BASE, use BACKEND_URL for images
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
};

const RestaurantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [siteStatus, setSiteStatus] = useState<string>('online');
  const [statusLoading, setStatusLoading] = useState(true);

  // Improve redirect logic to be more tolerant during loading
  useEffect(() => {
    // Only redirect if auth is finished loading AND we're definitely not authenticated
    // This prevents redirects during the initial loading phase
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    // Only redirect if we know the user is not a restaurant
    // This allows the component to render while the user data is still loading
    else if (!isLoading && user && user.role !== 'restaurant') {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Fetch orders and menu for this restaurant
  useEffect(() => {
    // Only attempt to fetch data if we have a token (even if not fully authenticated yet)
    // This handles the case where token exists but auth state is still loading
    const storedToken = localStorage.getItem('token') || token;
    if (!storedToken) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the API_BASE constant for consistency
        const [ordersRes, menuRes] = await Promise.all([
          fetch(`${API_BASE}/restaurants/orders`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`
            }
          }),
          fetch(`${API_BASE}/restaurants/products`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`
            }
          })
        ]);
        if (!ordersRes.ok) throw new Error('Failed to fetch orders');
        if (!menuRes.ok) throw new Error('Failed to fetch menu');
        setOrders(await ordersRes.json());
        setMenu(await menuRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Could not fetch data');
      }
      setLoading(false);
    };
    fetchData();

    // Fetch banners for restaurant dashboard (same as Home)
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/banners`);
        const data = await res.json();
        setBanners(
          data
            .filter((b: any) => b.isActive)
            .map((b: any) => ({
              ...b,
              image: b.image && b.image.startsWith('/uploads')
                ? `${BACKEND_URL}${b.image}`
                : b.image
            }))
        );
      } catch {
        setBanners([]);
      }
    };
    fetchBanners();
  }, [token]);

  // Fetch platform status on mount
  useEffect(() => {
    setStatusLoading(true);
    fetch(`${API_BASE}/admin/system-status`)
      .then(res => res.json())
      .then(data => setSiteStatus(data.status || 'online'))
      .catch(() => setSiteStatus('online'))
      .finally(() => setStatusLoading(false));
  }, []);

  // Stats
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const totalSales = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);

  // Add this for total orders
  const totalOrders = orders.length;

  // Render loading state while auth is still initializing
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Only render checking auth message briefly while verifying role
  if (!isAuthenticated) {
    // Attempt to use localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'restaurant') {
          // Continue rendering the dashboard if localStorage indicates user is a restaurant
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

  // Approval status
  const isApproved = user?.isApproved || false;

  // Tab change handler
  const handleTabChange = (value: string) => {
    setError(null);
    setActiveTab(value);
    if (value === 'orders') navigate('/restaurant/orders');
    if (value === 'menu') navigate('/restaurant/menu');
  };

  // Add a helper to check if site is disabled
  const isSiteDisabled = siteStatus === 'offline' || siteStatus === 'maintenance';

  return (
    <div className="app-container">
      {/* Remove the top fixed status banner */}
      <div>
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')} 
              className="mr-2 p-1 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">Restaurant Dashboard</h1>
          </div>
          <div>
            <button
              onClick={() => navigate('/restaurant/notifications')}
              className="p-2 relative"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-app-primary rounded-full text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="p-4 pb-24">
          {!isApproved && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Account Pending Approval
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Your account is awaiting verification. Complete the verification process to start receiving orders.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <Button
                    onClick={() => navigate('/restaurant/document-verification')}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Upload Documents
                  </Button>
                  <Button
                    onClick={() => navigate('/restaurant/approval-status')}
                    variant="outline"
                    className="border-amber-300"
                  >
                    Check Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="bg-app-primary text-white p-4 rounded-xl mb-6">
            <h2 className="text-xl font-semibold">Welcome, {user?.name}</h2>
            <p className="opacity-90">Restaurant Partner Dashboard</p>
            {/* Site status message - show for all statuses */}
            {(siteStatus === 'online' || isSiteDisabled) && (
              <div className={`mt-3 p-3 rounded-lg border text-center font-semibold text-base
                ${siteStatus === 'online' ? 'bg-green-50 border-green-200 text-green-700' : ''}
                ${siteStatus === 'maintenance' ? 'bg-orange-50 border-orange-200 text-orange-700' : ''}
                ${siteStatus === 'offline' ? 'bg-red-50 border-red-200 text-red-700' : ''}
              `}>
                {siteStatus === 'online' && 'We are live. Welcome!'}
                {siteStatus === 'offline' && 'We are Offline, not accepting orders currently. Please check back later!'}
                {siteStatus === 'maintenance' && 'Maintenance Mode: We are performing scheduled maintenance. Please try again soon.'}
              </div>
            )}
          </div>

          {/* Banner Section with carousel (same as Home) */}
          <div className="mx-4 mt-4 rounded-2xl border border-app-primary/40 shadow-sm overflow-hidden">
            <PromoBannerCarousel banners={banners} />
          </div>
          <div className="mb-4" /> {/* Add space below banner section */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {/* <div className="grid grid-cols-1 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Orders</CardDescription>
                    <CardTitle>{totalOrders}</CardTitle>
                  </CardHeader>
                </Card>
              </div> */}

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Your Performance</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-gray-600 text-sm">Order Fulfillment</p>
                      <p className="text-xl font-semibold">98%</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-gray-600 text-sm">Rating</p>
                      <p className="text-xl font-semibold">4.7/5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button 
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate('/restaurant/orders')}
                >
                  <List className="h-6 w-6 mb-2" />
                  <span>View Orders</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate('/restaurant/menu')}
                >
                  <Utensils className="h-6 w-6 mb-2" />
                  <span>View Menu</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <div className="mb-4 flex justify-between">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/restaurant/orders')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3 mb-6">
                {loading ? (
                  <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <div 
                      key={order._id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                      onClick={() => navigate(`/restaurant/orders/${order._id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber || order._id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">{order.customerName || 'Customer'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
                          <p className="text-xs text-blue-600">{order.status.replace('_', ' ').toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items?.map((item: any) => item.name).join(', ')}
                      </div>
                    </div>
                  ))
                )}
                {!loading && orders.length === 0 && (
                  <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                    <p className="text-gray-500">No recent orders</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="menu" className="mt-4">
              <div className="mb-4 flex justify-between">
                <h3 className="text-lg font-semibold">Menu Items</h3>
                <Button 
                  size="sm" 
                  className="bg-app-primary hover:bg-app-accent text-white flex items-center gap-1"
                  onClick={() => navigate('/restaurant/menu/add')}
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3 mb-6">
                {loading ? (
                  <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : (
                  menu.slice(0, 3).map(item => (
                    <div 
                      key={item._id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loading && menu.length === 0 && (
                  <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                    <p className="text-gray-500">No menu items</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <RestaurantBottomNav />
    </div>
  );
};

export default RestaurantDashboard;
