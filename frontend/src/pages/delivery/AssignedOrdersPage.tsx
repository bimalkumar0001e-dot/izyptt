import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Package, MapPin, Calendar, User, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { OrderStatus } from '@/types/order';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { DeliveryBottomNav } from '@/components/delivery/DeliveryBottomNav';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const DeliveryOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get token from localStorage (fallback if not in context)
  const token = localStorage.getItem('token');

  // Only redirect if auth check is finished
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'delivery')) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Fetch orders assigned to this delivery partner from backend
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/delivery/orders`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        setError('Could not fetch orders');
        setOrders([]);
      }
      setLoading(false);
    };
    if (token) fetchOrders();
  }, [token]);

  // Filtering logic for new requirements
  const normalizeStatus = (status: string | undefined) => (status ? status.toLowerCase() : '');

  // Sort orders by createdAt descending (most recent first)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const newOrders = sortedOrders.filter(order =>
    ['pending', 'preparing', 'placed'].includes(normalizeStatus(order.status))
  );

  const activeOrders = sortedOrders.filter(order =>
    !['pending', 'preparing', 'placed', 'delivered', 'cancelled'].includes(normalizeStatus(order.status))
  );

  const pastOrders = sortedOrders.filter(order =>
    ['delivered', 'cancelled'].includes(normalizeStatus(order.status))
  );

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    toast("Order Status Updated", {
      description: `Order #${orderId.substring(0, 8)} is now ${newStatus.replace('_', ' ')}`,
      duration: 3000,
    });
    // Optionally: Call backend to update status
  };

  const handleAcceptOrder = (orderId: string) => {
    toast("Order Accepted", {
      description: `You have accepted order #${orderId.substring(0, 8)}`,
      duration: 3000,
    });
    // Optionally: Call backend to accept order
  };

  const renderOrderCard = (order: any, index?: number, isActive?: boolean) => (
    <div
      key={order._id}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-app-secondary rounded-full flex items-center justify-center mr-3">
            <Package className="w-5 h-5 text-app-primary" />
          </div>
          <div>
            <p className="font-medium">Order #{order.orderNumber || order._id?.substring(0, 8)}</p>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span>
                {order.createdAt
                  ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
                  : ''}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            ₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2) || order.totalAmount || 0}
          </p>
          <span className={`text-xs font-medium ${
            order.status === 'delivered'
              ? 'text-green-600'
              : order.status === 'cancelled' || order.status === 'canceled'
                ? 'text-red-600'
                : 'text-blue-600'
          }`}>
            {order.status?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex items-start mb-3">
        <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">Delivery Address</p>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress?.address}
          </p>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="space-y-2 mb-3">
          <div className="text-sm flex justify-between">
            <span className="font-medium flex items-center">
              <User className="w-4 h-4 mr-1" />
              Customer:
            </span>
            {order.customer?.name || order.customerName || 'N/A'}
          </div>
          <div className="text-sm flex justify-between">
            <span className="font-medium flex items-center">
              <Package className="w-4 h-4 mr-1" />
              Restaurant:
            </span>
            {order.restaurant?.restaurantDetails?.name || order.restaurantName || 'Multiple vendors'}
          </div>

          {order.status === 'out_for_delivery' && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => handleUpdateStatus(order._id, 'on_the_way')}
                className="flex-1 bg-app-primary text-white py-2 rounded-md text-sm"
              >
                On The Way
              </button>
              <button
                onClick={() => handleUpdateStatus(order._id, 'heavy_traffic')}
                className="flex-1 bg-orange-500 text-white py-2 rounded-md text-sm"
              >
                Heavy Traffic
              </button>
            </div>
          )}

          {order.status === 'on_the_way' && (
            null
          )}
        </div>
      )}

      {order.status === 'packed' && (
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => handleAcceptOrder(order._id)}
            className="flex-1 bg-app-primary text-white py-2 rounded-md text-sm"
          >
            Accept
          </button>
          <button
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md text-sm"
          >
            Reject
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => navigate(`/delivery/orders/${order._id}`)}
          className="flex-1 text-app-primary text-sm font-medium flex items-center justify-center border border-app-primary rounded-md py-2 hover:bg-app-primary hover:text-white transition"
        >
          View Details
        </button>
        <button
          onClick={async (e) => {
            e.stopPropagation();
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
          className="flex-1 bg-blue-500 text-white text-sm font-medium rounded-md py-2 hover:bg-blue-600 transition"
          disabled={
            !['preparing', 'packed', 'placed', 'pending', 'picked', 'packing'].includes(
              (order.status || '').toLowerCase()
            )
          }
        >
          Picked
        </button>
        <button
          onClick={async (e) => {
            e.stopPropagation();
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
          className="flex-1 bg-yellow-500 text-white text-sm font-medium rounded-md py-2 hover:bg-yellow-600 transition"
          disabled={
            !['preparing', 'packed', 'placed', 'pending', 'picked', 'packing'].includes(
              (order.status || '').toLowerCase()
            )
          }
        >
          On Way
        </button>
        {order.status !== 'delivered' && order.status !== 'Delivered' && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const res = await fetch(`${API_BASE}/delivery/orders/${order._id}/status`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ status: 'Delivered' }),
                  credentials: 'include'
                });
                if (!res.ok) throw new Error('Failed to update status');
                toast('Order marked as delivered');
                setOrders((prev: any[]) => prev.map(o => o._id === order._id ? { ...o, status: 'delivered' } : o));
              } catch (err) {
                toast('Error', { description: 'Could not mark as delivered' });
              }
            }}
            className="flex-1 bg-green-600 text-white text-sm font-medium rounded-md py-2 hover:bg-green-700 transition"
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  // Add this handler to switch tab via navigation
  const handleTabChange = (value: string) => {
    if (value === 'active') return; // Already on this page
    if (value === 'available') return; // Stay on this page for available
    if (value === 'completed') return; // Stay on this page for completed
    if (value === 'orders') {
      navigate('/delivery/orders');
    }
  };

  // Show loading spinner while auth is loading
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  if (!isAuthenticated || user?.role !== 'delivery') {
    return null;
  }

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/delivery/dashboard')}
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">My Deliveries</h1>
        </div>
        <div>
          <button
            onClick={() => navigate('/delivery/notifications')}
            className="p-2 relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-app-primary rounded-full"></span>
          </button>
        </div>
      </header>

      <div className="p-4 pb-16">
        <Tabs defaultValue="new" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="new" className="text-xs sm:text-sm">
              New
              {newOrders.length > 0 && (
                <span className="ml-1 w-5 h-5 bg-app-primary rounded-full text-white text-xs flex items-center justify-center">
                  {newOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Active
              {activeOrders.length > 0 && (
                <span className="ml-1 w-5 h-5 bg-orange-500 rounded-full text-white text-xs flex items-center justify-center">
                  {activeOrders.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="text-xs sm:text-sm">
              Past
              {pastOrders.length > 0 && (
                <span className="ml-1 w-5 h-5 bg-green-500 rounded-full text-white text-xs flex items-center justify-center">
                  {pastOrders.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            {loading ? (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : newOrders.length > 0 ? (
              <div>
                {newOrders.map((order, index) => renderOrderCard(order, index, true))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">No new orders</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {loading ? (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : activeOrders.length > 0 ? (
              <div>
                {activeOrders.map((order, index) => renderOrderCard(order, index, true))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">No active orders</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {loading ? (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : pastOrders.length > 0 ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Past Deliveries</h2>
                    <button
                      className="flex items-center gap-2 px-3 py-1 bg-app-primary text-white rounded hover:bg-app-accent"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Filter by Date
                    </button>
                  </div>
                  {showDatePicker && (
                    <input
                      type="date"
                      className="mb-4 px-2 py-1 border rounded"
                      value={filterDate}
                      onChange={e => setFilterDate(e.target.value)}
                      max={formatDate(new Date())}
                    />
                  )}
                  {pastOrders
                    .filter(order => {
                      if (!filterDate) return true;
                      const orderDate = formatDate(new Date(order.deliveredAt || order.createdAt));
                      return orderDate === filterDate;
                    })
                    .map((order, index) => renderOrderCard(order, index))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">No past orders</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <DeliveryBottomNav />
    </div>
  );
};

export default DeliveryOrdersPage;
