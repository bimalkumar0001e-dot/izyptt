import React, { useState, useEffect, useRef } from 'react';
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
import { toast } from "@/components/ui/sonner";

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
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [orderTimers, setOrderTimers] = useState<{[orderId: string]: number}>({});

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

  // Timer effect: update every second
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
                {siteStatus === 'offline' && 'We are Closed, not accepting orders currently. Please check back later!'}
                {siteStatus === 'maintenance' && 'Maintenance Mode: We are performing scheduled maintenance. Please try again soon.'}
              </div>
            )}
          </div>

          {/* Banner Section with carousel (same as Home) */}
          <div className="mx-4 mt-4 rounded-2xl border border-app-primary/40 shadow-sm overflow-hidden">
            <PromoBannerCarousel banners={banners} />
          </div>
          <div className="mb-4" /> {/* Add space below banner section */}

          {/* --- Active Orders Countdown Banner --- */}
          {orders && orders.length > 0 && (
            <div className="mb-6">
              {orders
                .filter(o => !['delivered','cancelled','canceled'].includes((o.status || '').toLowerCase()))
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // oldest first
                .map(order => {
                  // Timer logic
                  const orderPlacedTime = new Date(order.createdAt).getTime();
                  const now = orderTimers[order._id] || Date.now();
                  let elapsed = Math.floor((now - orderPlacedTime) / 1000);

                  let secondsLeft = 0;
                  let isFirstTimer = true;
                  let delayed = false;
                  let timerLabel = '';
                  if (elapsed < 30 * 60) {
                    // Initial 30 min timer
                    secondsLeft = 30 * 60 - elapsed;
                    isFirstTimer = true;
                    delayed = false;
                    timerLabel = '';
                  } else {
                    // After 30 min, repeat 15 min timer with "Order Delayed"
                    const delayElapsed = elapsed - 30 * 60;
                    const delayCycle = Math.floor(delayElapsed / (15 * 60));
                    const delayCycleElapsed = delayElapsed % (15 * 60);
                    secondsLeft = 15 * 60 - delayCycleElapsed;
                    isFirstTimer = false;
                    delayed = true;
                    timerLabel = 'Order Delayed';
                  }
                  const totalSeconds = isFirstTimer ? 30 * 60 : 15 * 60;
                  const percent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);
                  const formatTimer = (secs: number) => {
                    const m = Math.floor(secs / 60).toString().padStart(2, '0');
                    const s = (secs % 60).toString().padStart(2, '0');
                    return `${m}:${s}`;
                  };
                  return (
                    <div key={order._id || order.id} className="mx-4 mb-4 p-4 rounded-xl shadow bg-gradient-to-r from-indigo-100 to-pink-100 border border-indigo-200 flex flex-col items-center">
                      <div className="flex w-full justify-between items-center mb-2">
                        <span className={`font-semibold text-lg ${delayed ? 'text-orange-600' : 'text-app-primary'}`}>
                          Order in progress
                          {delayed && (
                            <span className="ml-2 text-orange-600 font-bold">{timerLabel}</span>
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
                      <div className="w-full h-3 rounded-full bg-gray-200 mb-2 relative overflow-visible">
                        <div style={{ width: `${percent}%` }} className="h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-300" />
                        {/* Delivery boy image, same as TrackOrder/OrderConfirmation */}
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
                      {/* Ordered items list */}
                      <div className="w-full mb-2">
                        <span className="font-semibold">Items:</span>
                        <ul className="list-disc ml-6 mt-1 text-base">
                          {order.items?.map((item: any, idx: number) => (
                            <li key={idx}>
                              {item.quantity}x {item.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Preparing & Packing buttons */}
                      <div className="flex gap-3 w-full mt-2">
                        <Button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                          disabled={((order.status || '').toLowerCase() !== 'placed')}
                          onClick={async () => {
                            try {
                              const freshToken = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE}/restaurants/orders/${order._id}/status`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${freshToken}`
                                },
                                body: JSON.stringify({ status: 'preparing' })
                              });
                              if (!res.ok) throw new Error('Failed to update status');
                              toast.success('Order marked as Preparing');
                              setOrders((prev) =>
                                prev.map(o =>
                                  o._id === order._id ? { ...o, status: 'preparing' } : o
                                )
                              );
                            } catch (err) {
                              toast.error('Failed to mark as Preparing');
                            }
                          }}
                        >
                          Preparing
                        </Button>
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                          disabled={((order.status || '').toLowerCase() !== 'preparing')}
                          onClick={async () => {
                            try {
                              const freshToken = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE}/restaurants/orders/${order._id}/status`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${freshToken}`
                                },
                                body: JSON.stringify({ status: 'packing' })
                              });
                              if (!res.ok) throw new Error('Failed to update status');
                              toast.success('Order marked as Packing');
                              setOrders((prev) =>
                                prev.map(o =>
                                  o._id === order._id ? { ...o, status: 'packing' } : o
                                )
                              );
                            } catch (err) {
                              toast.error('Failed to mark as Packing');
                            }
                          }}
                        >
                          Packing
                        </Button>
                      </div>
                      <Button
                        className="mt-2 bg-app-primary hover:bg-app-accent text-white px-6 py-2 rounded-lg font-semibold"
                        onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
                      >
                        View Details
                      </Button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      <RestaurantBottomNav />
      {/* Modal for order details */}
      {selectedOrder && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${modalOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => setModalOpen(false)}
            >
              <span className="text-xl">×</span>
            </button>
            <h2 className="text-lg font-semibold mb-2">Order Details</h2>
            <div className="mb-2">
              <span className="font-semibold">Order #:</span> {selectedOrder.orderNumber || selectedOrder._id?.substring(0,8)}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span> {selectedOrder.status?.replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Customer:</span> {selectedOrder.customer?.name || selectedOrder.customerName || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Phone:</span> {selectedOrder.customer?.phone || selectedOrder.customerPhone || "-"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Delivery Address:</span>{" "}
              {selectedOrder.deliveryAddress ? (
                <>
                  {selectedOrder.deliveryAddress.title && (
                    <span className="font-semibold">{selectedOrder.deliveryAddress.title}</span>
                  )}
                  <div>
                    {selectedOrder.deliveryAddress.fullAddress || selectedOrder.deliveryAddress.address || "No address specified"}
                  </div>
                  {selectedOrder.deliveryAddress.landmark && (
                    <div>Landmark: {selectedOrder.deliveryAddress.landmark}</div>
                  )}
                  <div>
                    {[selectedOrder.deliveryAddress.city, selectedOrder.deliveryAddress.state, selectedOrder.deliveryAddress.pincode].filter(Boolean).join(", ") || "Location details not available"}
                  </div>
                  {selectedOrder.deliveryAddress.distance !== undefined && selectedOrder.deliveryAddress.distance !== null && !isNaN(Number(selectedOrder.deliveryAddress.distance)) && (
                    <div className="mt-1">
                      <span className="font-semibold">Distance:</span> {selectedOrder.deliveryAddress.distance} km
                    </div>
                  )}
                </>
              ) : (
                selectedOrder.address || selectedOrder.deliveryAddress || "-"
              )}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Payment Mode:</span> {selectedOrder.paymentMethod}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Total:</span> ₹{(selectedOrder.finalAmount ?? selectedOrder.totalAmount ?? 0).toFixed(2)}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Items:</span>
              <ul className="list-disc ml-6 mt-1">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <li key={idx}>
                    {item.quantity}x {item.name} - ₹{item.total?.toFixed(2) || item.price?.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold">Status Timeline:</span>
                <ul className="list-disc ml-6 mt-1 text-xs text-gray-600">
                  {selectedOrder.statusTimeline.map((st: any, idx: number) => (
                    <li key={idx}>
                      {st.status?.replace(/_/g, ' ').toUpperCase()} - {new Date(st.timestamp).toLocaleString()}
                      {st.note && <span> ({st.note})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
