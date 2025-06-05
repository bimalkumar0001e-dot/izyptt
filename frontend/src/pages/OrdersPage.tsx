import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Truck } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { OrderStatusBar } from '@/components/OrderStatusBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types/order';
import { formatDistanceToNow } from 'date-fns';
import { BACKEND_URL } from '@/utils/utils';

const UPLOADS_BASE = BACKEND_URL;

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrders = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${BACKEND_URL}/api/customer/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Failed to fetch orders');
          const data = await res.json();
          // Sort orders by createdAt descending (most recent first)
          const sorted = (data || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const active = sorted.filter((order: any) => !['delivered', 'cancelled', 'canceled'].includes(order.status));
          const past = sorted.filter((order: any) => ['delivered', 'cancelled', 'canceled'].includes(order.status));
          setActiveOrders(active);
          setPastOrders(past);
        } catch (err) {
          setActiveOrders([]);
          setPastOrders([]);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString();
  };

  // Define a reusable order card component for consistent styling
  const OrderCard = ({ order }: { order: Order }) => {
    const mainItem = order.items?.[0];
    let imgSrc = mainItem?.image || mainItem?.product?.image || '/placeholder.png';
    if (imgSrc && typeof imgSrc === 'string' && imgSrc.startsWith('/uploads')) {
      imgSrc = `${UPLOADS_BASE}${imgSrc}`;
    }

    // Get restaurant name if available, otherwise show 'izypt store'
    let restaurantName = "izypt store";
    if ((order as any).restaurant && typeof (order as any).restaurant === 'object' && (order as any).restaurant.name) {
      restaurantName = (order as any).restaurant.name;
    }

    // Status badge color and label
    const status = order.status || '';
    const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    // Only check for 'canceled' (not 'cancelled')
    const statusColor = status === 'delivered' ? 'bg-green-600' : status === 'canceled' ? 'bg-red-500' : 'bg-indigo-600';

    // Use order.id as fallback for order number and key
    const orderNumber = (order as any).orderNumber || order.id || '';
    // Use finalAmount, fallback to totalAmount, then 0
    const total = (order as any).finalAmount ?? (order as any).totalAmount ?? 0;
    // Use paymentMethod or fallback
    const paymentMethod = (order as any).paymentMethod || 'N/A';
    // Use createdAt or fallback to empty string
    const createdAt = (order as any).createdAt || '';
    // Use id for navigation
    const orderId = order.id || order._id || '';

    return (
      <div
        className="shadow-lg border border-gray-100 bg-[#ffd6db] overflow-hidden flex flex-col w-full max-w-full sm:max-w-md aspect-auto rounded-xl mb-4"
        style={{
          margin: '0 auto',
          minHeight: 0,
        }}
      >
        {/* Status badge at the top */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${statusColor}`}>{statusLabel}</span>
          <span className="ml-auto text-xs text-gray-500">{formatDate(createdAt)}</span>
        </div>
        <div className="flex flex-1 p-4 gap-3 items-center min-h-0">
          <img
            src={imgSrc}
            alt={mainItem?.name || 'Product'}
            className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            style={{ maxWidth: 80, maxHeight: 80 }}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <div className="font-semibold text-base truncate mb-1">{mainItem?.name || 'Order Item'}</div>
            <div className="text-xs text-gray-600 truncate">{restaurantName}</div>
            <div className="text-xs text-gray-500 mt-1">Qty: {mainItem?.quantity || 1}</div>
            <div className="text-xs text-gray-500 mt-1">Payment: {paymentMethod}</div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-dashed border-gray-300"></div>
        {/* Order Details - fit into a single row with flex and small fonts */}
        <div className="bg-white px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 text-sm">
          <div className="flex flex-col">
            <span className="font-medium">Order #{orderNumber}</span>
            <span className="text-xs text-gray-500">Total: ₹{total}</span>
          </div>
          <Button
            size="sm"
            className="mt-2 sm:mt-0"
            onClick={() => navigate(`/track-order/${orderId}`)}
          >
            Track Order
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        background: "#f5f5f5" // changed from gradient to grey white
      }}
    >
      <AppHeader title="My Orders" showBackButton />
      <div className="flex-1 p-4 pb-24">
        {/* Tabs for Active/Past Orders */}
        <Tabs value={tab} onValueChange={setTab} className="mb-4">
          <TabsList className="w-full flex">
            <TabsTrigger value="active" className="flex-1">Active Orders</TabsTrigger>
            <TabsTrigger value="past" className="flex-1">Past Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No active orders found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="past">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <span className="text-gray-500">Loading...</span>
              </div>
            ) : pastOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No past orders found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {pastOrders.map(order => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default OrdersPage;
