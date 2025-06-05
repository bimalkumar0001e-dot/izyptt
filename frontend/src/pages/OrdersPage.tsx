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
        className="shadow-lg border border-gray-100 bg-[#ffd6db] overflow-hidden flex flex-col"
        style={{
          width: '100%',
          maxWidth: 500,
          aspectRatio: '16 / 9',
          margin: '0 auto',
          minHeight: 0,
        }}
      >
        {/* Status badge at the top */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <span
            className={`inline-block px-4 py-1 text-xs font-bold text-white rounded-full ${statusColor}`}
            style={{ minWidth: 70, textAlign: 'center' }}
          >
            {statusLabel}
          </span>
          <span className="text-xs text-gray-400 ml-2 truncate" style={{ maxWidth: 180 }}>{orderNumber}</span>
        </div>
        <div className="flex flex-1 p-4" style={{ minHeight: 0 }}>
          <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0">
            <img
              src={imgSrc}
              alt={mainItem?.name || "Order"}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
            />
          </div>
          <div className="ml-4 flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="font-extrabold text-lg text-gray-900 truncate">
                {mainItem ? `${mainItem.quantity}x ${mainItem.name}` : "Order"}
              </div>
            </div>
            {/* Show restaurant name at the bottom left */}
            <div className="text-xs text-gray-600 mt-2 truncate">{restaurantName}</div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-dashed border-gray-300"></div>
        {/* Order Details - fit into a single row with flex and small fonts */}
        <div className="bg-white px-4 py-3 flex justify-between items-end gap-2" style={{ fontSize: "0.98rem" }}>
          <div>
            <div className="font-bold text-[#ff4d4f]" style={{ fontSize: "1.02rem" }}>Order</div>
            <div className="text-gray-500">Total: <span className="font-bold text-gray-800">₹{total.toFixed(2)}</span></div>
            <div className="text-gray-500">Payment: <span className="font-bold text-gray-800">{paymentMethod}</span></div>
          </div>
          <div className="text-xs text-gray-500 text-right whitespace-nowrap mb-2">
            {formatDate(createdAt)}
          </div>
          <div className="flex flex-col items-end justify-end">
            <Button
              className="bg-[#ff4d4f] hover:bg-[#ff6f61] text-white font-bold px-4 py-1 rounded-lg text-sm"
              onClick={() => navigate(`/track-order/${orderId}`)}
              style={{ minWidth: 110 }}
            >
              Track Order
            </Button>
          </div>
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
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="past">Past Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center py-12">Loading...</div>
            ) : activeOrders.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <Truck className="w-12 h-12 mb-2" />
                <div>No active orders</div>
                <div className="text-sm text-gray-400 mt-1">Your active orders will appear here</div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {loading ? (
              <div className="flex justify-center py-12">Loading...</div>
            ) : pastOrders.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <Truck className="w-12 h-12 mb-2" />
                <div>No past orders</div>
                <div className="text-sm text-gray-400 mt-1">Your delivered or cancelled orders will appear here</div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrdersPage;
