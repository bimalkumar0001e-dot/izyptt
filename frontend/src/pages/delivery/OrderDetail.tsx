import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, MapPin, Phone, User, CreditCard, Package } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const allowedStatuses = [
  'Reached Vendor',
  'Picked Up',
  'On the Way to Customer',
  'Delivered'
];

// Map UI status to backend enum
const statusMap: Record<string, string> = {
  'Reached Vendor': 'confirmed',
  'Picked Up': 'picked',
  'On the Way to Customer': 'on_the_way',
  'Delivered': 'delivered'
};

const DeliveryOrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'delivery') {
      navigate('/login');
      return;
    }
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/delivery/orders/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError('Could not fetch order details');
      }
      setLoading(false);
    };
    if (id && token) fetchOrder();
  }, [id, token, isAuthenticated, user, navigate]);

  const handleOpenStatusDialog = () => {
    setSelectedStatus('');
    setStatusDialogOpen(true);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handleConfirmStatus = async () => {
    if (!selectedStatus) return;
    setStatusLoading(true);
    try {
      const backendStatus = statusMap[selectedStatus] || selectedStatus;
      const res = await fetch(`${API_BASE}/delivery/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: backendStatus, note: statusNote }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast('Order status updated', { description: `Order status changed to ${selectedStatus}` });
      setStatusDialogOpen(false);
      // Refresh order data
      const data = await res.json();
      setOrder(data.order || { ...order, status: backendStatus });
    } catch (err) {
      toast('Error', { description: 'Could not update order status' });
    }
    setStatusLoading(false);
  };

  if (!isAuthenticated || user?.role !== 'delivery') {
    return null;
  }

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Order Details</h1>
        </div>
      </header>
      <div className="p-4 pb-24">
        {loading ? (
          <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-xl text-center border border-red-200 text-red-600">
            {error}
          </div>
        ) : order ? (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-app-primary mr-2" />
              <span className="font-semibold text-lg">Order #{order.orderNumber || order._id?.substring(0, 8)}</span>
            </div>
            <div className="mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
                {order.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <User className="w-4 h-4 mr-1 text-gray-500" />
                <span className="font-medium">Customer:</span>
                <span className="ml-2">{order.customer?.name || order.customerName || 'N/A'}</span>
              </div>
              <div className="flex items-center mb-1">
                <Phone className="w-4 h-4 mr-1 text-gray-500" />
                <span className="font-medium">Phone:</span>
                <span className="ml-2">{order.customer?.phone || order.customerPhone || 'N/A'}</span>
              </div>
              <div className="flex items-center mb-1">
                <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                <span className="font-medium">Address:</span>
                <span className="ml-2">
                  {order.deliveryAddress?.address}, {order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center mb-1">
                <CreditCard className="w-4 h-4 mr-1 text-gray-500" />
                <span className="font-medium">Payment Mode:</span>
                <span className="ml-2 capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="font-medium">Total:</span>
                <span className="ml-2">₹{order.finalAmount?.toFixed(2) || order.totalAmount?.toFixed(2) || order.totalAmount || 0}</span>
              </div>
            </div>
            {/* You can add more details here, like items, timeline, etc. */}
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Items</h2>
              <ul className="divide-y divide-gray-100">
                {order.items?.map((item: any, idx: number) => (
                  <li key={idx} className="py-2 flex justify-between">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{item.total?.toFixed(2) || item.price?.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                onClick={async () => {
                  setStatusLoading(true);
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
                    // Refresh order data
                    const data = await res.json();
                    setOrder(data.order || { ...order, status: 'Delivered' });
                  } catch (err) {
                    toast('Error', { description: 'Could not mark as delivered' });
                  }
                  setStatusLoading(false);
                }}
                className="bg-green-600 text-white"
                disabled={
                  order.status === 'Delivered' ||
                  order.status === 'delivered' ||
                  order.status === 'Cancelled' ||
                  order.status === 'cancelled' ||
                  statusLoading
                }
              >
                {statusLoading ? 'Updating...' : 'Mark as Delivered'}
              </Button>
              <Button
                onClick={handleOpenStatusDialog}
                className="bg-app-primary text-white"
                disabled={
                  order.status === 'Delivered' ||
                  order.status === 'delivered' ||
                  order.status === 'Cancelled' ||
                  order.status === 'cancelled' ||
                  statusLoading
                }
              >
                Change Status
              </Button>
            </div>
            {statusDialogOpen && (
              <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                  <div className="bg-white rounded-lg p-6 w-full max-w-xs">
                    <h2 className="font-semibold mb-2">Change Order Status</h2>
                    <select
                      className="w-full border rounded p-2 mb-4"
                      value={selectedStatus}
                      onChange={handleStatusChange}
                    >
                      <option value="">Select status</option>
                      {allowedStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <textarea
                      className="w-full border rounded p-2 mb-4"
                      placeholder="Add a note (optional)"
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={statusLoading}>
                        Cancel
                      </Button>
                      <Button onClick={handleConfirmStatus} disabled={!selectedStatus || statusLoading}>
                        {statusLoading ? 'Updating...' : 'Confirm'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Dialog>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DeliveryOrderDetail;
