import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, MapPin, Calendar, Clock, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { DeliveryBottomNav } from '@/components/delivery/DeliveryBottomNav';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const AssignedPickups: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assigned pickups from backend
  useEffect(() => {
    const fetchPickups = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/delivery/pickups`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to fetch pickups');
        const data = await res.json();
        setPickups(data);
      } catch (err: any) {
        setError('Could not fetch pickups');
        setPickups([]);
      }
      setLoading(false);
    };
    fetchPickups();
  }, []);

  // Fix: Normalize status to lowercase for filtering, and fallback to 'N/A' for missing fields
  const normalizeStatus = (status: string | undefined) => (status ? status.toLowerCase() : 'n/a');

  // Filter pickups based on status and search query (case-insensitive, robust)
  const isNew = (order: any) => normalizeStatus(order.status) === 'pending';
  const isActive = (order: any) => !['pending', 'delivered', 'cancelled'].includes(normalizeStatus(order.status));
  const isPast = (order: any) => ['delivered', 'cancelled'].includes(normalizeStatus(order.status));
  const newOrders = pickups.filter(isNew);
  const activeOrders = pickups.filter(isActive);
  const pastOrders = pickups.filter(isPast);

  // Only redirect if auth check is finished
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'delivery')) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Show loading spinner while auth is loading
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Handle accepting a pickup
  const handleAcceptOrder = async (pickupId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/delivery/pickups/${pickupId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      if (!res.ok) throw new Error('Failed to accept pickup');
      toast('Pickup Accepted', { description: `You have accepted pickup order #${pickupId}` });
      setPickups(pickups => pickups.map(p => p._id === pickupId ? { ...p, status: 'accepted' } : p));
    } catch {
      toast('Error', { description: 'Could not accept pickup' });
    }
  };

  // Handle updating pickup status
  const handleUpdateStatus = async (pickupId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      // Always send status as "Delivered" (capital D) for mark as delivered
      const statusToSend = status === 'delivered' ? 'Delivered' : status;
      const res = await fetch(`${API_BASE}/delivery/pickups/${pickupId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusToSend })
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast('Status Updated', { description: `Pickup order #${pickupId} status updated to ${statusToSend}` });
      setPickups(pickups => pickups.map(p => p._id === pickupId ? { ...p, status: statusToSend } : p));
    } catch {
      toast('Error', { description: 'Could not update status' });
    }
  };

  // Navigate to pickup detail page
  const handleViewDetails = (pickupId: string) => {
    navigate(`/delivery/pickup/${pickupId}`);
  };

  // Render a pickup order card (Picked/On Way buttons allow status change for any pickup)
  const renderOrderCard = (order: any) => (
    <div
      key={order._id}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-5 p-4 relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full border border-gray-200">ID: {order._id?.substring(0, 8) || 'N/A'}</span>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : order.status === 'picked' ? 'bg-blue-100 text-blue-800' : order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{order.status?.toUpperCase() || 'N/A'}</span>
        </div>
        <div className="text-right">
          {order.totalAmount === undefined || order.totalAmount === null ? (
            <span className="font-bold text-lg">₹N/A</span>
          ) : (
            <span className="font-bold text-lg">₹{order.totalAmount}</span>
          )}
        </div>
      </div>
      <div className="font-semibold text-base mb-1">{order.itemType || 'N/A'}</div>
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <Calendar className="w-4 h-4 mr-1" />
        <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</span>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-700">Pickup Location</span>
        </div>
        <div className="ml-6 text-gray-700 text-sm">{order.pickupAddress || 'N/A'}</div>
      </div>
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="font-semibold text-gray-700">Drop Location</span>
        </div>
        <div className="ml-6 text-gray-700 text-sm">{order.dropAddress || 'N/A'}</div>
      </div>
      <div className="text-center mt-2 flex flex-col gap-2">
        <button
          className="text-orange-600 font-semibold hover:underline text-base"
          onClick={() => handleViewDetails(order._id)}
        >
          View Details
        </button>
        {/* Picked and On Way buttons: disable unless status is pending, placed, booked, picked, on way, reached pickup location */}
        <div className="flex flex-row gap-2 justify-center mt-2">
          <Button
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            onClick={() => handleUpdateStatus(order._id, 'picked')}
            disabled={
              !['pending', 'placed', 'booked', 'picked', 'on way', 'reached pickup location'].includes(
                (order.status || '').toLowerCase()
              )
            }
          >
            Picked
          </Button>
          <Button
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
            onClick={() => handleUpdateStatus(order._id, 'on_the_way')}
            disabled={
              !['pending', 'placed', 'booked', 'picked', 'on way', 'reached pickup location'].includes(
                (order.status || '').toLowerCase()
              )
            }
          >
            On Way
          </Button>
        </div>
        {normalizeStatus(order.status) !== 'delivered' && normalizeStatus(order.status) !== 'cancelled' && (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold mt-2"
            onClick={() => handleUpdateStatus(order._id, 'Delivered')}
          >
            Mark as Delivered
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={() => navigate('/delivery/dashboard')} className="mr-2 p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Pickup Orders</h1>
        </div>
        <div>
          <button onClick={() => navigate('/delivery/notifications')} className="p-2 relative">
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
        <Tabs defaultValue="new" className="mb-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="new">New <span className="ml-1 text-xs font-bold text-blue-500">{newOrders.length}</span></TabsTrigger>
            <TabsTrigger value="active">Active <span className="ml-1 text-xs font-bold text-blue-500">{activeOrders.length}</span></TabsTrigger>
            <TabsTrigger value="past">Past <span className="ml-1 text-xs font-bold text-green-500">{pastOrders.length}</span></TabsTrigger>
          </TabsList>
          <TabsContent value="new">
            {newOrders.length === 0 ? (
              <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">No new pickup orders</p>
              </div>
            ) : (
              newOrders.map(renderOrderCard)
            )}
          </TabsContent>
          <TabsContent value="active">
            {activeOrders.length === 0 ? (
              <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">No active pickup orders</p>
              </div>
            ) : (
              activeOrders.map(renderOrderCard)
            )}
          </TabsContent>
          <TabsContent value="past">
            {pastOrders.length === 0 ? (
              <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
                <p className="text-gray-500">No past pickup orders</p>
              </div>
            ) : (
              pastOrders.map(renderOrderCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
      <DeliveryBottomNav />
    </div>
  );
};

export default AssignedPickups;
