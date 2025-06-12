import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Home, Package } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types/order';
import { BACKEND_URL } from '@/utils/utils';
import { playNotificationSound } from '@/utils/soundUtils';
import { showConfetti, showSimpleConfetti } from '@/utils/confettiUtils';

const API_BASE = `${BACKEND_URL}/api`;

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [soundPlayed, setSoundPlayed] = useState(false);
  const [animationPlayed, setAnimationPlayed] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [adminDeliveryFee, setAdminDeliveryFee] = useState<number | null>(null);
  const [adminHandlingCharge, setAdminHandlingCharge] = useState<number | null>(null);
  const [adminGstTax, setAdminGstTax] = useState<number | null>(null);

  // Play sound effect and show confetti when component mounts
  useEffect(() => {
    if (!soundPlayed) {
      playNotificationSound('/sounds/order-success.mp3');
      setSoundPlayed(true);
    }
    
    if (!animationPlayed) {
      // Try the regular confetti first, fall back to simple if it fails
      try {
        const cleanup = showConfetti();
        if (!cleanup) {
          showSimpleConfetti();
        }
      } catch (error) {
        showSimpleConfetti();
      }
      setAnimationPlayed(true);
    }
  }, [soundPlayed, animationPlayed]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/customer/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Order not found');
          const data = await res.json();
          setOrder(data.order || data);
        } catch (err) {
          setOrder(null);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  // Fetch admin fees/taxes for breakdown
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

  // Calculate breakdown using order data (use stored values if present)
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
  // Use values from order if present, else fallback to admin values
  const deliveryFeeToShow = order?.deliveryFee !== undefined ? order.deliveryFee : (adminDeliveryFee !== null ? adminDeliveryFee : (order?.deliveryFee ?? 0));
  const handlingChargeToShow = order?.handlingCharge !== undefined ? order.handlingCharge : (adminHandlingCharge !== null ? adminHandlingCharge : 0);
  const gstTaxToShow = order?.taxAmount !== undefined ? order.taxAmount : (adminGstTax !== null ? (subtotal * adminGstTax / 100) : (order?.tax ?? 0));
  const total =
    subtotal +
    deliveryFeeToShow +
    gstTaxToShow +
    handlingChargeToShow -
    discount;

  if (!order) {
    return (
      <div className="app-container">
        <AppHeader title="Order Confirmation" showBackButton />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AppHeader title="Order Placed" />
      <div className="flex-1 p-4">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-green-700">Order Placed Successfully!</h2>
          <p className="text-gray-600 mt-1">
            Your order has been placed and is being reviewed.
          </p>
          <div className="mt-4 bg-gray-100 px-4 py-2 rounded-lg inline-block">
            <p className="font-medium text-indigo-700">
              Order ID: <span className="font-bold text-pink-600">#{order.id ? order.id.substring(0, 8) : ''}</span>
            </p>
          </div>
        </div>
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-2 text-app-primary">Order Details</h3>
          <div className="mb-2 flex justify-between">
            <span className="text-gray-600">Restaurant</span>
            <span className="font-semibold text-pink-600">{order.restaurantName || 'N/A'}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-600 font-medium">Items:</span>
            <ul className="ml-4 mt-1">
              {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span className="text-indigo-700">{item.name}</span>
                  <span className="text-gray-700">Qty: <span className="font-semibold">{item.quantity}</span></span>
                </li>
              )) : <li className="text-gray-400">No items</li>}
            </ul>
          </div>
          {/* --- Breakdown Section --- */}
          <div className="my-4 border-t border-b py-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-blue-700">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium text-orange-600">
                {order?.deliveryFee === undefined && adminDeliveryFee === null
                  ? <span className="text-gray-400">Loading...</span>
                  : <>₹{deliveryFeeToShow.toFixed(2)}</>
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Tax{order?.taxAmount !== undefined ? '' : (adminGstTax !== null ? ` (${adminGstTax}%)` : '')}
              </span>
              <span className="font-medium text-purple-700">
                {order?.taxAmount === undefined && adminGstTax === null
                  ? <span className="text-gray-400">Loading...</span>
                  : <>₹{gstTaxToShow.toFixed(2)}</>
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Handling Charge</span>
              <span className="font-medium text-yellow-700">
                {order?.handlingCharge === undefined && adminHandlingCharge === null
                  ? <span className="text-gray-400">Loading...</span>
                  : <>₹{handlingChargeToShow.toFixed(2)}</>
                }
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600 font-semibold">-₹{discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="mb-2 flex justify-between font-semibold text-lg">
            <span className="text-gray-700">Total Amount</span>
            <span className="text-green-700">
              {order?.deliveryFee === undefined && (adminDeliveryFee === null || adminHandlingCharge === null || adminGstTax === null)
                ? <span className="text-gray-400">Loading...</span>
                : <>₹{total.toFixed(2)}</>
              }
            </span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-gray-600">Payment Method</span>
            <span className="capitalize font-semibold text-blue-700">{order.paymentMethod || 'N/A'}</span>
          </div>
        </div>
        <div className="flex flex-col space-y-3 mt-8">
          <Button
            onClick={() => navigate(`/track-order/${orderId}`)}
            className="bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-bold"
          >
            <Package className="w-5 h-5 mr-2" />
            Track Order
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-gray-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
