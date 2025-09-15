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
  const [orderTimers, setOrderTimers] = useState<{[orderId: string]: number}>({});

  // Timer effect: update every second for active orders
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderTimers((prev) => {
        const now = Date.now();
        const updated: {[orderId: string]: number} = {};
        orders.forEach(order => {
          if (!['delivered','cancelled','canceled'].includes((order.status || '').toLowerCase())) {
            updated[order._id] = now;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [orders]);

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
        
        {/* --- Assigned Orders with Countdown --- */}
        <div className="mb-6">
          {orders
            .filter(order => !['delivered','cancelled','canceled'].includes((order.status || '').toLowerCase()))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // oldest first
            .map(order => {
              // 15-minute countdown timer logic
              const orderPlacedTime = new Date(order.createdAt).getTime();
              const now = orderTimers[order._id] || Date.now();
              const elapsed = Math.floor((now - orderPlacedTime) / 1000);

              let secondsLeft = 0;
              let isFirstTimer = true;
              let delayed = false;
              if (elapsed < 30 * 60) {
                secondsLeft = 30 * 60 - elapsed;
                isFirstTimer = true;
                delayed = false;
              } else {
                const delayElapsed = elapsed - 30 * 60;
                const current15MinCycle = delayElapsed % (15 * 60);
                secondsLeft = 15 * 60 - current15MinCycle;
                isFirstTimer = false;
                delayed = true;
              }
              const totalSeconds = isFirstTimer ? 30 * 60 : 15 * 60;
              const percent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);
              const formatTimer = (secs: number) => {
                const m = Math.floor(secs / 60).toString().padStart(2, '0');
                const s = (secs % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
              };
              return (
                <div key={order._id} className="mx-4 mb-4 p-4 rounded-xl shadow bg-gradient-to-r from-indigo-100 to-pink-100 border border-indigo-200 flex flex-col items-center">
                  <div className="flex w-full justify-between items-center mb-2">
                    <span className={`font-semibold text-lg ${delayed ? 'text-orange-600' : 'text-app-primary'}`}>
                      Assigned Order
                      {delayed && (
                        <span className="ml-2 text-orange-600 font-bold">You are delayed</span>
                      )}
                    </span>
                    <span className="font-bold text-2xl px-3 py-1 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-white flex items-center gap-2">
                      {formatTimer(secondsLeft)} <span role="img" aria-label="timer">⏰</span>
                    </span>
                  </div>
                  {/* Show exact timestamp of order placed */}
                  <div className="w-full text-right text-xs text-gray-500 mb-2">
                    Placed at: {new Date(order.createdAt).toLocaleString()}
                  </div>
                  {/* Show current status */}
                  <div className="w-full text-left text-xs text-gray-700 mb-2 font-semibold">
                    Status: {order.status?.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  {/* Progress bar with delivery boy image */}
                  <div className="w-full h-3 rounded-full bg-gray-200 mb-2 relative overflow-visible">
                    <div style={{ width: `${percent}%` }} className="h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300" />
                    <img
                      src="/delivery_boy.png"
                      alt="Delivery Boy"
                      style={{
                        position: 'absolute',
                        top: '-20px',
                        left: `calc(${percent}% - 16px)`,
                        height: '40px',
                        width: '40px',
                        objectFit: 'contain',
                        transition: 'left 1s linear',
                        zIndex: 2,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  <div className="text-xl font-bold text-center mb-2">
                    Total Amount: <span className="text-green-700">₹{Math.ceil(order.finalAmount ?? order.totalAmount ?? 0)}</span>
                  </div>
                  <div className="w-full mb-2">
                    <span className="font-semibold">Address:</span>
                    <div className="text-base ml-2">
                      {/* Show title if available */}
                      {order.deliveryAddress?.title && (
                        <span className="font-semibold">{order.deliveryAddress.title}</span>
                      )}
                      <div>
                        {order.deliveryAddress?.fullAddress || order.deliveryAddress?.address || "No address specified"}
                      </div>
                      {order.deliveryAddress?.landmark && (
                        <div>Landmark: {order.deliveryAddress.landmark}</div>
                      )}
                      <div>
                        {[order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.pincode].filter(Boolean).join(", ") || "Location details not available"}
                      </div>
                      {order.deliveryAddress?.distance !== undefined && order.deliveryAddress?.distance !== null && !isNaN(Number(order.deliveryAddress.distance)) && (
                        <div className="mt-1">
                          <span className="font-semibold">Distance:</span> {order.deliveryAddress.distance} km
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 w-full mt-2">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                      disabled={((order.status || '').toLowerCase() === 'picked')}
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/delivery/orders/${order._id}/status`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: 'picked' }),
                            credentials: 'include'
                          });
                          if (!res.ok) throw new Error('Failed to update status');
                          toast('Order marked as picked');
                          setOrders((prev: any[]) => prev.map(o => o._id === order._id ? { ...o, status: 'picked' } : o));
                        } catch (err) {
                          toast('Error', { description: 'Could not mark as picked' });
                        }
                      }}
                    >
                      Picked
                    </Button>
                    <Button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                      disabled={((order.status || '').toLowerCase() === 'on_the_way')}
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/delivery/orders/${order._id}/status`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: 'on_the_way' }),
                            credentials: 'include'
                          });
                          if (!res.ok) throw new Error('Failed to update status');
                          toast('Order marked as on the way');
                          setOrders((prev: any[]) => prev.map(o => o._id === order._id ? { ...o, status: 'on_the_way' } : o));
                        } catch (err) {
                          toast('Error', { description: 'Could not mark as on the way' });
                        }
                      }}
                    >
                      On Way
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                      disabled={((order.status || '').toLowerCase() === 'delivered')}
                      onClick={async () => {
                        try {
                          const res = await fetch(`${API_BASE}/delivery/orders/${order._id}/status`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ status: 'delivered' }),
                            credentials: 'include'
                          });
                          if (!res.ok) throw new Error('Failed to update status');
                          toast('Order marked as delivered');
                          setOrders((prev: any[]) => prev.map(o => o._id === order._id ? { ...o, status: 'delivered' } : o));
                        } catch (err) {
                          toast('Error', { description: 'Could not mark as delivered' });
                        }
                      }}
                    >
                      Delivered
                    </Button>
                  </div>
                  <Button
                    className="mt-2 bg-app-primary hover:bg-app-accent text-white px-6 py-2 rounded-lg font-semibold"
                    onClick={() => navigate(`/delivery/orders/${order._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
      
      <DeliveryBottomNav />
    </div>
  );
};

export default DeliveryDashboard;
