import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Truck, Star } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { OrderStatusBar } from '@/components/OrderStatusBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
  const [reviewModal, setReviewModal] = useState<{ open: boolean, orderId?: string, productId?: string }>(
    { open: false }
  );
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

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

  // Handle review modal open
  const openReviewModal = (orderId: string, productId: string) => {
    setReviewModal({ open: true, orderId, productId });
    setReviewImage(null);
    setReviewNote('');
    setReviewStars(0);
    setReviewError(null);
  };

  // Handle review submit
  const handleReviewSubmit = async () => {
    if (!reviewModal.orderId || !reviewModal.productId) return;
    if (!reviewStars) {
      setReviewError('Please select a star rating.');
      return;
    }
    setReviewLoading(true);
    setReviewError(null);
    try {
      const formData = new FormData();
      formData.append('rating', String(reviewStars));
      formData.append('reviewText', reviewNote);
      if (reviewImage) formData.append('image', reviewImage);
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/customer/orders/${reviewModal.orderId}/rate-product/${reviewModal.productId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit review');
      }
      setReviewModal({ open: false });
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
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

    // Find first productId for review (for simplicity, only allow review for first item)
    const firstProductId = mainItem?.product?._id || mainItem?.product || mainItem?._id;

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
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg mb-1">{mainItem?.name || 'Product'}</div>
            <div className="text-sm text-gray-600">{restaurantName}</div>
            <div className="text-xs text-gray-500">Qty: {mainItem?.quantity || 1}</div>
            <div className="text-xs text-gray-500">Payment: {paymentMethod}</div>
          </div>
        </div>
        {/* Divider */}
        <div className="border-t border-dashed border-gray-300"></div>
        {/* Order Details - fit into a single row with flex and small fonts */}
        <div className="bg-white px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 text-sm">
          <div>
            <div className="font-bold">Order #{orderNumber}</div>
            <div>Total: ₹{total}</div>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">  // Action buttons
            <Button
              variant="outline"
              className="text-orange-600 border-orange-500 hover:bg-orange-50 bg-[#ff7300] border-2 border-[#ff7300] font-semibold text-white shadow-none hover:bg-[#ff7300]/90 hover:text-white focus:ring-2 focus:ring-orange-300"
              onClick={() => navigate(`/track-order/${orderId}`)}
            >
              Track Order
            </Button>
            {/* Show Add Review button only if delivered */}
            {status === 'delivered' && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => openReviewModal(orderId, firstProductId)}
              >
                Add Review
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Review Modal UI
  const ReviewModal = (
    <Dialog open={reviewModal.open} onOpenChange={open => setReviewModal({ open })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  className="p-0 bg-transparent border-none"
                  onClick={() => setReviewStars(star)}
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    size={28}
                    fill={reviewStars >= star ? "#fbbf24" : "none"}
                    stroke="#fbbf24"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Review Note</label>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              maxLength={200}
              placeholder="Write a short review..."
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Upload Image (optional, 1 only)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setReviewImage(e.target.files[0]);
                }
              }}
            />
            {reviewImage && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={URL.createObjectURL(reviewImage)}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded border"
                />
                <button
                  type="button"
                  className="text-xs text-red-500 underline"
                  onClick={() => setReviewImage(null)}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          {reviewError && <div className="text-red-500 text-sm">{reviewError}</div>}
        </div>
        <DialogFooter>
          <Button
            onClick={handleReviewSubmit}
            disabled={reviewLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {reviewLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        background: "#f5f5f5"
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
      {ReviewModal}
    </div>
  );
};

export default OrdersPage;
