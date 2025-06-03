import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { RestaurantBottomNav } from '@/components/restaurant/RestaurantBottomNav';
import { toast } from "@/components/ui/sonner";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const OrdersPage: React.FC = () => {
  const { user, isAuthenticated, token, isLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'new' | 'active' | 'past'>('new');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Use token from state or localStorage
        const freshToken = localStorage.getItem('token') || token;
        
        if (!freshToken) {
          console.error("No authentication token available");
          toast.error("Authentication error", {
            description: "Please login again to refresh your session"
          });
          return;
        }

        console.log("Using token for orders fetch");
        
        const apiUrl = `${API_BASE}/restaurants/orders`;
        console.log("Fetching orders from:", apiUrl);

        const res = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${freshToken}`
          },
        });
        
        // Check for HTML response (error page)
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.error("Received HTML instead of JSON - likely a session error");
          throw new Error("Invalid response format (received HTML). Please log in again.");
        }
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API Error:", res.status, errorText);
          throw new Error(`Failed to fetch orders: ${res.status} ${errorText}`);
        }
        
        const data = await res.json();
        console.log("Orders data received:", data);
        
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.error("API returned non-array data:", data);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders", {
          description: error instanceof Error ? error.message : "Unknown error"
        });
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
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

  // Order filtering
  const newOrders = orders.filter(
    o => (o.status || '').toLowerCase() === 'placed'
  );
  const activeOrders = orders.filter(
    o => ['preparing', 'packing'].includes((o.status || '').toLowerCase())
  );
  const pastOrders = orders.filter(
    o => !['preparing', 'packing', 'pending', 'placed'].includes((o.status || '').toLowerCase())
  );

  // Helper to format time ago
  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  }

  // Modal component for order details
  const OrderDetailsModal = ({ order, open, onClose }: { order: any, open: boolean, onClose: () => void }) => {
    if (!open || !order) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold mb-2">Order Details</h2>
          <div className="mb-2">
            <span className="font-semibold">Order #:</span> {order.orderNumber || order._id?.substring(0,8)}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Status:</span> {order.status?.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Customer:</span> {order.customer?.name || order.customerName || "-"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Phone:</span> {order.customer?.phone || order.customerPhone || "-"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Delivery Address:</span>{" "}
            {order.deliveryAddress
              ? `${order.deliveryAddress.address || ''}${order.deliveryAddress.landmark ? ', ' + order.deliveryAddress.landmark : ''}${order.deliveryAddress.city ? ', ' + order.deliveryAddress.city : ''}${order.deliveryAddress.state ? ', ' + order.deliveryAddress.state : ''}${order.deliveryAddress.pincode ? ' - ' + order.deliveryAddress.pincode : ''}`.replace(/^,\s*/, '')
              : order.address || order.deliveryAddress || "-"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Payment Mode:</span> {order.paymentMethod}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Total:</span> ₹{(order.finalAmount ?? order.totalAmount ?? 0).toFixed(2)}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Items:</span>
            <ul className="list-disc ml-6 mt-1">
              {order.items?.map((item: any, idx: number) => (
                <li key={idx}>
                  {item.quantity}x {item.name} - ₹{item.total?.toFixed(2) || item.price?.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          {order.statusTimeline && order.statusTimeline.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold">Status Timeline:</span>
              <ul className="list-disc ml-6 mt-1 text-xs text-gray-600">
                {order.statusTimeline.map((st: any, idx: number) => (
                  <li key={idx}>
                    {st.status?.replace(/_/g, ' ').toUpperCase()} - {new Date(st.timestamp).toLocaleString()}
                    {st.note && <> ({st.note})</>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center px-4 py-3 bg-white border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="mr-2 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">All Orders</h1>
      </header>
      <div className="p-4 pb-24">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 bg-gray-50 rounded-xl p-1">
          <button
            className={`flex-1 py-2 rounded-xl font-medium ${tab === 'new' ? 'bg-white text-black shadow' : 'text-gray-600'}`}
            onClick={() => setTab('new')}
          >
            New
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-medium relative ${tab === 'active' ? 'bg-white text-black shadow' : 'text-gray-600'}`}
            onClick={() => setTab('active')}
          >
            Active {activeOrders.length > 0 && <span className="ml-1 inline-block bg-orange-500 text-white text-xs rounded-full px-2">{activeOrders.length}</span>}
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-medium relative ${tab === 'past' ? 'bg-white text-black shadow' : 'text-gray-600'}`}
            onClick={() => setTab('past')}
          >
            Past {pastOrders.length > 0 && <span className="ml-1 inline-block bg-green-500 text-white text-xs rounded-full px-2">{pastOrders.length}</span>}
          </button>
        </div>
        {/* Tab content */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : (
          <div className="space-y-4">
            {(tab === 'new' ? newOrders : tab === 'active' ? activeOrders : pastOrders).length === 0 ? (
              <div className="text-center text-gray-500 py-10">No orders found.</div>
            ) : (
              (tab === 'new' ? newOrders : tab === 'active' ? activeOrders : pastOrders).map((order) => {
                const isDelivered = order.status?.toLowerCase() === "delivered";
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-xl shadow border border-gray-100 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-orange-100 text-orange-600 rounded-full p-2">
                          <span role="img" aria-label="box">📦</span>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">Order #{order.orderNumber || order._id?.substring(0,8)}</div>
                          <div className="text-xs text-gray-500">{timeAgo(order.createdAt)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₹{(order.finalAmount ?? order.totalAmount ?? 0).toFixed(2)}</div>
                        <div className={
                          order.status === 'delivered'
                            ? 'text-green-600 font-semibold text-xs'
                            : order.status === 'cancelled'
                            ? 'text-red-600 font-semibold text-xs'
                            : 'text-blue-600 font-semibold text-xs'
                        }>
                          {order.status?.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="mb-1 flex items-start gap-2">
                      <span className="text-gray-500"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z"/><circle cx="12" cy="11" r="3"/></svg></span>
                      <div>
                        <div className="font-semibold text-sm">Delivery Address</div>
                        <div className="text-sm text-gray-700 leading-tight">
                          {order.deliveryAddress
                            ? `${order.deliveryAddress.address || ''}${order.deliveryAddress.landmark ? ', ' + order.deliveryAddress.landmark : ''}${order.deliveryAddress.city ? ', ' + order.deliveryAddress.city : ''}${order.deliveryAddress.state ? ', ' + order.deliveryAddress.state : ''}${order.deliveryAddress.pincode ? ' - ' + order.deliveryAddress.pincode : ''}`.replace(/^,\s*/, '')
                            : order.address || order.deliveryAddress || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div className="text-sm">
                        <span className="font-semibold">Customer:</span> {order.customer?.name || order.customerName || "-"}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Restaurant:</span> {order.restaurant?.restaurantDetails?.name || order.restaurant?.name || order.restaurantName || (user as any)?.restaurantDetails?.name || "-"}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items?.map((item: any, idx: number) => (
                        <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs text-gray-700">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      {/* Preparing button: enabled only for 'placed' (new) orders */}
                      <Button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                        disabled={(tab !== 'new')}
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
                      {/* Packing button: enabled only for 'preparing' (active) orders */}
                      <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                        disabled={(tab !== 'active')}
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
                      <Button
                        variant="outline"
                        className="text-orange-600 border-orange-200 flex-1"
                        onClick={() => {
                          setSelectedOrder(order);
                          setModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <OrderDetailsModal order={selectedOrder} open={modalOpen} onClose={() => setModalOpen(false)} />
      <RestaurantBottomNav />
    </div>
  );
};

export default OrdersPage;
