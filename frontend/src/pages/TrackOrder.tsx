import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, ArrowDown } from 'lucide-react';
import { Order } from '@/types/order';
import { toast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;
const FIVE_MINUTES = 5 * 60 * 1000;

const TrackOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');
  const [adminDeliveryFee, setAdminDeliveryFee] = useState<number | null>(null);
  const [adminHandlingCharge, setAdminHandlingCharge] = useState<number | null>(null);
  const [adminGstTax, setAdminGstTax] = useState<number | null>(null);

  // Timer state for countdown and progress bar
  const [secondsLeft, setSecondsLeft] = useState(0); // Will be calculated
  const [delayMessage, setDelayMessage] = useState('');
  const [isFirstTimer, setIsFirstTimer] = useState(true);
  const [delayStart, setDelayStart] = useState<number | null>(null);
  const [deliveredElapsed, setDeliveredElapsed] = useState<number | null>(null);

  useEffect(() => {
    if (!order || !order.createdAt) return;
    const orderPlacedTime = new Date(order.createdAt).getTime();
    const deliveredTime = order.deliveryDate ? new Date(order.deliveryDate).getTime() : null;
    const now = Date.now();
    const elapsed = Math.floor((now - orderPlacedTime) / 1000);

    // If delivered or cancelled, freeze timer and stop interval
    if (order.status === 'delivered' || ['cancelled','canceled'].includes((order.status || '').toLowerCase())) {
      let deliveryDurationSecs = deliveredTime ? Math.floor((deliveredTime - orderPlacedTime) / 1000) : (elapsed > 30*60 ? 30*60 : elapsed);
      setSecondsLeft(0);
      setIsFirstTimer(false);
      setDelayMessage(order.status === 'delivered'
        ? `Your order has been delivered within ${formatTimer(deliveryDurationSecs)}.`
        : 'Order has been cancelled.'
      );
      return;
    }

    // Initial 30 min timer
    if (elapsed < 30 * 60) {
      setSecondsLeft(30 * 60 - elapsed);
      setIsFirstTimer(true);
      setDelayMessage('');
      setDelayStart(null);
    } else {
      // After 30 min, start repeating 15 min timers until delivered/cancelled
      setIsFirstTimer(false);
      const delayElapsed = elapsed - 30 * 60;
      const current15MinCycle = delayElapsed % (15 * 60);
      setSecondsLeft(15 * 60 - current15MinCycle);
      setDelayMessage('Your order is slightly delayed.');
      setDelayStart(orderPlacedTime + 30 * 60 * 1000 + Math.floor(delayElapsed / (15 * 60)) * 15 * 60 * 1000);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - orderPlacedTime) / 1000);
      if (order.status === 'delivered' || ['cancelled','canceled'].includes((order.status || '').toLowerCase())) {
        let deliveryDurationSecs = deliveredTime ? Math.floor((deliveredTime - orderPlacedTime) / 1000) : (elapsed > 30*60 ? 30*60 : elapsed);
        setSecondsLeft(0);
        setIsFirstTimer(false);
        setDelayMessage(order.status === 'delivered'
          ? `Your order has been delivered within ${formatTimer(deliveryDurationSecs)}.`
          : 'Order has been cancelled.'
        );
        clearInterval(interval);
        return;
      }
      if (elapsed < 30 * 60) {
        setSecondsLeft(30 * 60 - elapsed);
        setIsFirstTimer(true);
        setDelayMessage('');
        setDelayStart(null);
      } else {
        setIsFirstTimer(false);
        const delayElapsed = elapsed - 30 * 60;
        const current15MinCycle = delayElapsed % (15 * 60);
        setSecondsLeft(15 * 60 - current15MinCycle);
        setDelayMessage('Your order is slightly delayed.');
        setDelayStart(orderPlacedTime + 30 * 60 * 1000 + Math.floor(delayElapsed / (15 * 60)) * 15 * 60 * 1000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  // Format timer as MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Calculate progress for progress bar
  const totalSeconds = isFirstTimer ? 30 * 60 : 15 * 60;
  // If delivered, freeze timer at delivery time
  let deliveryDurationSecs = null;
  if (order?.status === 'delivered' && order?.createdAt) {
    if (order.deliveryDate) {
      deliveryDurationSecs = Math.floor((new Date(order.deliveryDate).getTime() - new Date(order.createdAt).getTime()) / 1000);
    } else {
      const deliveredElapsed = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 1000);
      deliveryDurationSecs = deliveredElapsed > 30*60 ? 30*60 : deliveredElapsed;
    }
  }
  const percent = order?.status === 'delivered' ? 100 : Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);
  const timerDisplay = order?.status === 'delivered' && deliveryDurationSecs !== null
    ? formatTimer(deliveryDurationSecs)
    : formatTimer(secondsLeft);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${BACKEND_URL}/api/customer/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Order not found');
          const data = await res.json();
          setOrder(data.order || data);
        } catch (err) {
          setOrder(null);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  // Fetch admin fees/taxes for breakdown (same as OrderConfirmation)
  useEffect(() => {
    fetch(`${API_BASE}/admin/delivery-fee`)
      .then(res => res.json())
      .then((fees) => {
        const activeFee = Array.isArray(fees)
          ? fees.find((fee: any) => fee.isActive)
          : null;
        if (activeFee) setAdminDeliveryFee(activeFee.amount);
        else setAdminDeliveryFee(0);
      })
      .catch(() => setAdminDeliveryFee(0));

    fetch(`${API_BASE}/admin/handling-charge`)
      .then(res => res.json())
      .then((charges) => {
        const activeCharge = Array.isArray(charges)
          ? charges.find((charge: any) => charge.isActive)
          : null;
        if (activeCharge) setAdminHandlingCharge(activeCharge.amount);
        else setAdminHandlingCharge(0);
      })
      .catch(() => setAdminHandlingCharge(0));

    fetch(`${API_BASE}/admin/gst-taxes`)
      .then(res => res.json())
      .then((taxes) => {
        const activeTax = Array.isArray(taxes)
          ? taxes.find((tax: any) => tax.isActive)
          : null;
        if (activeTax) setAdminGstTax(activeTax.percentage || activeTax.amount || 0);
        else setAdminGstTax(0);
      })
      .catch(() => setAdminGstTax(0));
  }, []);

  // Calculate breakdown using admin values and order data (same as OrderConfirmation)
  let subtotal = 0;
  let discount = 0;
  if (order && order.items) {
    subtotal = order.items.reduce(
      (sum, item) =>
        sum +
        ((item.price ?? 0) * (item.quantity ?? 1)),
      0
    );
    discount = order.discount || 0;
  }
  const deliveryFeeToShow = adminDeliveryFee !== null ? adminDeliveryFee : (order?.deliveryFee ?? 0);
  const handlingChargeToShow = adminHandlingCharge !== null ? adminHandlingCharge : 0;
  const gstTaxToShow = adminGstTax !== null ? (subtotal * adminGstTax / 100) : (order?.tax ?? 0);
  const total =
    subtotal +
    deliveryFeeToShow +
    gstTaxToShow +
    handlingChargeToShow -
    discount;

  // Use order.createdAt for time logic (not orderDate)
  const placedTime = order && (order.createdAt || order.orderDate) ? new Date(order.createdAt || order.orderDate) : null;
  const now = new Date();
  const timeSincePlaced = placedTime ? now.getTime() - placedTime.getTime() : 0;
  const canCancel =
    order &&
    placedTime &&
    timeSincePlaced < FIVE_MINUTES &&
    order.status &&
    !['cancelled', 'canceled', 'delivered'].includes(order.status.toLowerCase());

  const handleCancel = async () => {
    if (!orderId) return;
    if (!window.confirm('Are you sure you want to cancel this order? It may disable cod on your future orders!')) return;
    setCancelling(true);
    setCancelMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/customer/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.order && data.order.status === 'cancelled') {
        setOrder(prev => ({
          ...prev,
          ...data.order,
          status: 'cancelled'
        }));
        setCancelMsg('Order cancelled successfully. You will receive a full refund.');
        toast({ title: 'Order cancelled', description: 'Your order has been cancelled.' });
      } else {
        setCancelMsg(data.message || 'Failed to cancel order.');
        toast({ title: 'Failed to cancel order', description: data.message || 'Please try again.' });
      }
    } catch (err) {
      setCancelMsg('Failed to cancel order.');
      toast({ title: 'Failed to cancel order', description: 'Please try again.' });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <AppHeader title="Track Order" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="app-container">
        <AppHeader title="Track Order" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <p>Order not found.</p>
        </div>
      </div>
    );
  }

  // Determine current step for status stepper
  const statusSteps = [
    'placed',
    'preparing',
    'packing',
    'picked',
    'on_the_way',
    'delivered',
    'cancelled',
    'canceled',
  ];
  const statusLabels: Record<string, string> = {
    placed: 'Order Placed',
    preparing: 'Preparing',
    packing: 'Packing',
    picked: 'Picked',
    on_the_way: 'On the Way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
  };
  const currentStep = statusSteps.findIndex(s => s === (order.status || '').toLowerCase());

  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh",
        background: "#f5f5f5" // changed from gradient to grey white
      }}
    >
      <AppHeader title="Track Order" showBackButton />
      <div className="flex-1 p-4 pb-28">
        <div
          className="rounded-xl shadow p-4 mb-6 border border-gray-200"
          style={{
            background: "#fff"
          }}
        >
          <h2 className="text-lg font-semibold mb-2 text-app-primary">Order Status</h2>
          {/* Gradient separator */}
          <div
            style={{
              height: "4px",
              width: "100%",
              borderRadius: "2px",
              margin: "12px 0 20px 0",
              background: "linear-gradient(90deg, rgba(99,102,241,0), #6366f1 20%, #ec4899 80%, rgba(236,72,153,0))"
            }}
          />
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Restaurant:</span>
              <span className="text-sm font-semibold text-pink-600 text-right">{order.restaurantName || 'N/A'}</span>
            </div>
            {/* Show complete address */}
            <div className="flex items-start justify-between mt-1">
              <span className="text-sm text-gray-500">Delivery Address:</span>
              <div className="text-sm font-medium text-right">
                {/* Show title if available */}
                {order.deliveryAddress?.title && (
                  <p className="font-semibold">{order.deliveryAddress.title}</p>
                )}
                {/* Show full address (prefer fullAddress, fallback to address) */}
                <p>
                  {order.deliveryAddress?.fullAddress || order.deliveryAddress?.address || "No address specified"}
                </p>
                {/* Show landmark if available */}
                {order.deliveryAddress?.landmark && (
                  <p>Landmark: {order.deliveryAddress.landmark}</p>
                )}
                {/* Show city, state, pincode */}
                <p>
                  {[order.deliveryAddress?.city, order.deliveryAddress?.state, order.deliveryAddress?.pincode].filter(Boolean).join(", ") || "Location details not available"}
                </p>
                {/* Show distance if available */}
                {order.deliveryAddress?.distance !== undefined && order.deliveryAddress?.distance !== null && !isNaN(Number(order.deliveryAddress.distance)) && (
                  <p className="mt-1">
                    <span className="font-semibold">Distance:</span> {order.deliveryAddress.distance} km
                  </p>
                )}
              </div>
            </div>
            {/* Show delivery time */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Delivery Time:</span>
              <span className="text-sm font-semibold text-indigo-600 text-right">35-50 minutes</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Order No:</span>
              <span className="text-sm font-semibold text-indigo-700 text-right break-all">{order.id}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="text-sm font-bold text-green-700 text-right">
                {typeof order.finalAmount === 'number' && !isNaN(order.finalAmount)
                  ? <>₹{Math.ceil(order.finalAmount)}</>
                  : typeof order.total === 'number' && !isNaN(order.total)
                  ? <>₹{Math.ceil(order.total)}</>
                  : adminDeliveryFee === null || adminHandlingCharge === null || adminGstTax === null
                    ? <span className="text-gray-400">Loading...</span>
                    : <>₹{Math.ceil(total)}</>
                }
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Payment:</span>
              <span className="text-sm font-semibold text-blue-700 text-right">{order.paymentMethod || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Items:</span>
              <span className="text-sm font-medium text-right">{order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
            </div>
          </div>
          {/* --- Countdown and Progress Bar --- */}
          <div className="mb-6 flex flex-col items-center">
            <div className="flex items-center gap-2 text-xl font-bold text-indigo-700">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg shadow font-mono tracking-widest">
                {timerDisplay}
              </span>
              <span role="img" aria-label="clock">⏰</span>
            </div>
            <div className="w-64 h-4 bg-gray-200 rounded-full mt-3 relative overflow-visible">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 transition-all"
                style={{ width: `${percent}%` }}
              ></div>
              <img
                src="/delivery_boy.png"
                alt="Delivery Boy"
                style={{
                  position: 'absolute',
                  top: '-20px', // Move image above the bar
                  left: `calc(${percent}% - 16px)`, // Center image horizontally
                  height: '40px',
                  width: '40px',
                  objectFit: 'contain',
                  transition: 'left 1s linear',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div className="mt-1 text-xs text-gray-500">
              <span role="img" aria-label="sparkles">✨</span>
              Sit back and relax while we prepare your delicious meal!
              <span role="img" aria-label="pizza">🍕</span>
            </div>
            {delayMessage && (
              <div className="mt-2 text-sm text-red-500 font-semibold">
                {delayMessage}
              </div>
            )}
          </div>
          {/* Status Stepper */}
          <div className="my-6">
            <div className="flex flex-col gap-4">
              {statusSteps.slice(0, 6).map((step, idx) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs
                    ${idx <= currentStep && !['cancelled','canceled'].includes((order.status || '').toLowerCase()) ? 'bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow' : 'bg-gray-300 text-gray-500'}
                  `}>
                    {idx + 1}
                  </div>
                  <div>
                    <span className={`
                      font-semibold
                      ${idx === currentStep && !['cancelled','canceled'].includes((order.status || '').toLowerCase()) ? 'text-pink-600' : ''}
                      ${idx < currentStep && !['cancelled','canceled'].includes((order.status || '').toLowerCase()) ? 'text-indigo-700' : ''}
                      ${idx > currentStep || ['cancelled','canceled'].includes((order.status || '').toLowerCase()) ? 'text-gray-500' : ''}
                    `}>
                      {statusLabels[step]}
                    </span>
                    {['cancelled','canceled'].includes((order.status || '').toLowerCase()) && idx === currentStep && (
                      <span className="ml-2 text-red-500 font-semibold">(Cancelled)</span>
                    )}
                  </div>
                </div>
              ))}
              {/* Fix: Ensure this block is outside the map and inside the parent div */}
              {['cancelled','canceled'].includes((order.status || '').toLowerCase()) && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-red-500 text-white shadow">
                    X
                  </div>
                  <span className="font-semibold text-red-500">Cancelled</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-500">Current Status: </span>
            <span className="text-sm font-bold text-pink-700">{order.status?.replace('_',' ')}</span>
          </div>
          {/* Show cancel reason if cancelled by admin and reason exists */}
          {['cancelled', 'canceled'].includes((order.status || '').toLowerCase()) && order.cancellationReason && (
            <div className="mt-2 text-sm text-red-600">
              <span className="font-semibold">Reason:</span> {order.cancellationReason}
            </div>
          )}
          {/* Cancel Order Button */}
          <div className="flex flex-col items-end mt-6">
            <Button
              variant="destructive"
              className="px-6"
              onClick={handleCancel}
              disabled={!canCancel || cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
            {/* Always show this message below the button */}
            <span className="mt-2 text-xs text-gray-500">
              Order can be cancelled within 5 minutes of order placement.
            </span>
            {/* Show message if cancel is not allowed due to time */}
            {!canCancel && placedTime && (timeSincePlaced >= FIVE_MINUTES) && !['cancelled', 'canceled', 'delivered'].includes(order.status.toLowerCase()) && (
              <span className="mt-1 text-xs text-red-500 font-semibold">
                You can only cancel your order within 5 minutes of placing it.
              </span>
            )}
            {/* Show message if order is already cancelled or delivered */}
            {['cancelled', 'canceled', 'delivered'].includes((order.status || '').toLowerCase()) && (
              <span className="mt-1 text-xs text-gray-500">
                Order cannot be cancelled at this stage.
              </span>
            )}
          </div>
          {cancelMsg && (
            <div className="mt-3 text-center text-green-600 font-medium">{cancelMsg}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
