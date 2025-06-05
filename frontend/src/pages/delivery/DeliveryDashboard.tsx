import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Check, MapPin, ArrowLeft, Calendar, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryBottomNav } from '@/components/delivery/DeliveryBottomNav';
import { toast } from '@/components/ui/sonner';
import PromoBannerCarousel from '@/components/PromoBannerCarousel';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
// Remove hardcoded UPLOADS_BASE, use BACKEND_URL for images
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
};

const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);

  // Only redirect if auth check is finished with a small delay to ensure auth context is fully loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setDashboardLoading(false);
      if (!isLoading && (!isAuthenticated || user?.role !== 'delivery')) {
        navigate('/login');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user, navigate]);

  // Fetch orders assigned to this delivery partner from backend
  useEffect(() => {
    if (!isAuthenticated || !token) return; // Don't fetch if not authenticated
    
    const fetchOrders = async () => {
      setLoading(true);
      setError(null); // Clear error before fetching
      try {
        const res = await fetch(`${API_BASE}/delivery/orders`, { // Updated to use API_BASE
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError('Could not fetch orders');
      }
      setLoading(false);
    };
    fetchOrders();
  }, [token, isAuthenticated]);

  // Fetch banners for delivery dashboard (same as Home)
  useEffect(() => {
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
  }, [token, toast]);

  // Calculate stats from orders
  const assignedOrders = orders.filter(order => ['out_for_delivery', 'on_the_way', 'packed', 'ready', 'picked'].includes(order.status)).length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const todayEarnings = orders
    .filter(order => order.status === 'delivered' && new Date(order.deliveredAt).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  // Check if user is approved
  const isApproved = user?.isApproved || false;

  // Show loading spinner while dashboard is loading
  if (dashboardLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-primary"></div>
      </div>
    );
  }

  // If not authenticated or not a delivery partner after loading, don't render anything
  if (!isAuthenticated || (user && user.role !== 'delivery')) {
    return null;
  }

  // Handle mark as delivered - updated to use API_BASE
  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'delivered' }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update order');
      toast("Order Updated", {
        description: `Order #${orderId.substring(0, 8)} has been marked as delivered`,
      });
      // Refresh orders
      setOrders(orders => orders.map(o => o._id === orderId ? { ...o, status: 'delivered' } : o));
    } catch {
      toast('Error', { description: 'Could not update order status' });
    }
  };

  // Add this handler to switch tab via navigation
  const handleTabChange = (value: string) => {
    setError(null); // Clear error on tab switch
    if (value === 'overview') setActiveTab('overview');
    else if (value === 'orders') navigate('/delivery/orders');
    else if (value === 'pickups') navigate('/delivery/pickup');
  };

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Delivery Dashboard</h1>
        </div>
        <div>
          <button
            onClick={() => navigate('/delivery/notifications')}
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
                Your account is awaiting verification. Complete the verification process to start delivering.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button
                  onClick={() => navigate('/delivery/document-verification')}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Upload Documents
                </Button>
                <Button
                  onClick={() => navigate('/delivery/approval-status')}
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
          <p className="opacity-90">Delivery Partner Dashboard</p>
        </div>

        {/* Banner Section with carousel (same as Home) */}
        <div className="mx-4 mt-4 rounded-2xl border border-app-primary/40 shadow-sm overflow-hidden">
          <PromoBannerCarousel banners={banners} />
        </div>
        <div className="mb-4" />
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="pickups">Pickups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            {/* <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Today's Earnings</CardDescription>
                  <CardTitle>₹{todayEarnings}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Deliveries</CardDescription>
                  <CardTitle>{assignedOrders + deliveredOrders}</CardTitle>
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
                    <p className="text-gray-600 text-sm">On-time Rate</p>
                    <p className="text-xl font-semibold">95%</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-gray-600 text-sm">Rating</p>
                    <p className="text-xl font-semibold">4.8/5</p>
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
                onClick={() => navigate('/delivery/orders')}
              >
                <Package className="h-6 w-6 mb-2" />
                <span>View Orders</span>
              </Button>
              
              <Button 
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => navigate('/delivery/pickup')}
              >
                <MapPin className="h-6 w-6 mb-2" />
                <span>View Pickups</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-4">
            <div className="mb-4 flex justify-between">
              <h3 className="text-lg font-semibold">Active Deliveries</h3>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/delivery/orders')}
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
                orders
                  .filter(order => ['out_for_delivery', 'on_the_way'].includes(order.status))
                  .map((order) => (
                    <div 
                      key={order._id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                      onClick={() => navigate(`/delivery/orders/${order._id}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber || order._id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {order.restaurantName || 'Multiple Vendors'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
                          <p className="text-xs text-blue-600">
                            {order.status.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">{order.deliveryAddress?.address}</p>
                          <p className="text-sm text-gray-600">
                            {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 mr-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/delivery/orders/${order._id}`);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleMarkAsDelivered(order._id);
                          }}
                        >
                          Mark Delivered
                        </Button>
                      </div>
                    </div>
                  ))
              )}
              {!loading && orders.filter(order => ['out_for_delivery', 'on_the_way'].includes(order.status)).length === 0 && (
                <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                  <p className="text-gray-500">No active deliveries</p>
                </div>
              )}
            </div>
            
            <div className="mb-4 flex justify-between">
              <h3 className="text-lg font-semibold">New Orders</h3>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : (
                orders
                  .filter(order => order.status === 'packed')
                  .map((order) => (
                    <div 
                      key={order._id}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber || order._id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {order.restaurantName || 'Multiple Vendors'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-start mb-3">
                        <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-600">{order.deliveryAddress?.address}</p>
                          <p className="text-sm text-gray-600">
                            {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center mb-3">
                        <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-xs text-yellow-500">Ready for pickup</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-app-primary hover:bg-app-accent"
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))
              )}
              {!loading && orders.filter(order => order.status === 'packed').length === 0 && (
                <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                  <p className="text-gray-500">No new orders available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pickups" className="mt-4">
            <div className="mb-4 flex justify-between">
              <h3 className="text-lg font-semibold">Pickup Requests</h3>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/delivery/pickup')}
              >
                View All
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pickup requests</p>
              <p className="mt-2 text-sm text-gray-400">
                Check back later for pickup requests
              </p>
              <Button 
                className="mt-4 bg-app-primary hover:bg-app-accent"
                onClick={() => navigate('/delivery/pickup')}
              >
                Check Pickup Orders
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <DeliveryBottomNav />
    </div>
  );
};

export default DeliveryDashboard;
