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
    'picked',
    'on_the_way',
    'delivered',
    'cancelled',
    'canceled',
  ];
  const statusLabels: Record<string, string> = {
    placed: 'Order Placed',
    preparing: 'Preparing',
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
              <span className="text-sm font-medium text-right break-all">
                {/* Show full address with landmark, city, state, pincode */}
                {order.deliveryAddress?.fullAddress ||
                  [
                    order.deliveryAddress?.address,
                    order.deliveryAddress?.landmark,
                    order.deliveryAddress?.city,
                    order.deliveryAddress?.state,
                    order.deliveryAddress?.pincode
                  ]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
              </span>
            </div>
            {/* Show delivery time */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Delivery Time:</span>
              <span className="text-sm font-semibold text-indigo-600 text-right">30 minutes</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Order No:</span>
              <span className="text-sm font-semibold text-indigo-700 text-right break-all">{order.id}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="text-sm font-bold text-green-700 text-right">
                {adminDeliveryFee === null || adminHandlingCharge === null || adminGstTax === null
                  ? <span className="text-gray-400">Loading...</span>
                  : <>₹{total.toFixed(2)}</>
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
          {/* Status Stepper */}
          <div className="my-6">
            <div className="flex flex-col gap-4">
              {statusSteps.slice(0, 5).map((step, idx) => (
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
            {!canCancel && placedTime && (timeSincePlaced >= FIVE_MINUTES) && !['cancelled', 'canceled', 'delivered'].includes((order.status || '').toLowerCase()) && (
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
