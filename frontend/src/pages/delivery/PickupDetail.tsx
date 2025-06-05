import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  Package,
  MapPin,
  Phone,
  Clock,
  Calendar,
  User,
  CreditCard,
  Weight,
  Ruler,
  ArrowLeftRight
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const PickupDetail: React.FC = () => {
  const navigate = useNavigate();
  const { pickupId } = useParams<{ pickupId: string }>();
  const { user, isAuthenticated } = useAuth();

  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'delivery') {
      navigate('/login');
      return;
    }
    const fetchPickup = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/delivery/pickups/${pickupId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Pickup order not found');
        const data = await res.json();
        setPickup(data);
      } catch (err: any) {
        setError('Pickup order not found');
        setPickup(null);
      }
      setLoading(false);
    };
    fetchPickup();
  }, [pickupId, isAuthenticated, user, navigate]);

  // Update status dialog state
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  
  // Redirect if not authenticated or not delivery partner
  if (!isAuthenticated || user?.role !== 'delivery') {
    navigate('/login');
    return null;
  }
  
  // Redirect if pickup not found
  if (!pickup) {
    navigate('/delivery/pickup');
    toast("Error", {
      description: "Pickup order not found",
    });
    return null;
  }
  
  const handleStatusChange = async () => {
    if (!newStatus) {
      toast("Error", {
        description: "Please select a status",
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/delivery/pickups/${pickupId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, note: statusNote })
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setPickup(updated.pickup || updated); // update local state
      toast("Status Updated", {
        description: `Pickup order #${pickupId} status updated to ${newStatus.toUpperCase()}`,
      });
      setUpdateStatusDialogOpen(false);
      setNewStatus('');
      setStatusNote('');
    } catch (err) {
      toast("Error", {
        description: "Could not update status",
      });
    }
  };
  
  // Mark as Delivered handler
  const handleMarkAsDelivered = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/delivery/pickups/${pickupId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Delivered' })
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setPickup(updated.pickup || updated);
      toast("Status Updated", {
        description: `Pickup order #${pickupId} status updated to DELIVERED`,
      });
    } catch (err) {
      toast("Error", {
        description: "Could not update status",
      });
    }
  };
  
  const handleAction = (action: string) => {
    switch (action) {
      case 'accept':
        toast("Pickup Accepted", {
          description: `You have accepted pickup order #${pickupId}`,
        });
        break;
      case 'picked':
        setNewStatus('picked');
        setUpdateStatusDialogOpen(true);
        break;
      case 'delivered':
        setNewStatus('delivered');
        setUpdateStatusDialogOpen(true);
        break;
      case 'reject':
        setNewStatus('cancelled');
        setUpdateStatusDialogOpen(true);
        break;
      default:
        break;
    }
  };
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'picked':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };
  
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !pickup) return (
    <div className="p-8 text-center">
      <div className="font-bold text-lg text-red-600 mb-2">Error</div>
      <div className="text-gray-500">{error || 'Pickup order not found'}</div>
    </div>
  );

  return (
    <div className="app-container">
      <AppHeader title="Pickup Details" showBackButton />
      <div className="p-4 pb-20">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full border border-gray-200">ID: {pickup._id?.substring(0, 8) || 'N/A'}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${pickup.status === 'pending' ? 'bg-amber-100 text-amber-800' : pickup.status === 'picked' ? 'bg-blue-100 text-blue-800' : pickup.status === 'delivered' ? 'bg-green-100 text-green-800' : pickup.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : ''}`}>{pickup.status?.toUpperCase() || 'N/A'}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-lg">₹{pickup.totalAmount !== undefined && pickup.totalAmount !== null ? pickup.totalAmount : 'N/A'}</span>
                <span className="ml-2 text-gray-400 text-xs flex items-center gap-1"><Clock className="w-4 h-4 inline" />{pickup.estimatedTime ?? 'N/A'}</span>
              </div>
            </div>
            <div className="font-semibold text-base mb-1">{pickup.itemType || 'N/A'}</div>
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{pickup.createdAt ? new Date(pickup.createdAt).toLocaleString() : 'N/A'}</span>
            </div>
            {/* Pickup Location Details */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-700">Pickup Location</span>
              </div>
              <div className="ml-6 text-gray-700 text-sm">
                {pickup.pickupAddress || 'N/A'}
                <div className="text-xs text-gray-500 mt-1">
                  <User className="w-4 h-4 inline mr-1" />
                  {pickup.customer?.name || pickup.customerName || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {pickup.customer?.phone || pickup.customerPhone || 'N/A'}
                </div>
              </div>
            </div>
            {/* Drop Location Details */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-gray-700">Drop Location</span>
              </div>
              <div className="ml-6 text-gray-700 text-sm">
                {pickup.dropAddress || 'N/A'}
              </div>
            </div>
            {/* Add more details as needed */}
          </CardContent>
        </Card>
        <div className="flex justify-center mt-6 gap-4">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl text-lg"
            onClick={handleMarkAsDelivered}
            disabled={pickup.status === 'Delivered' || pickup.status === 'Cancelled'}
          >
            Mark as Delivered
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-xl text-lg"
            onClick={() => setUpdateStatusDialogOpen(true)}
            disabled={pickup.status === 'Delivered' || pickup.status === 'Cancelled'}
          >
            Change Status
          </Button>
        </div>
        <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Pickup Status</DialogTitle>
              <DialogDescription>Select the new status for this pickup.</DialogDescription>
            </DialogHeader>
            <RadioGroup value={newStatus} onValueChange={setNewStatus}>
              <div className="mb-2">
                <RadioGroupItem value="Reached pickup location" id="reached" />
                <Label htmlFor="reached" className="ml-2">Reached pickup location</Label>
              </div>
              <div className="mb-2">
                <RadioGroupItem value="Picked Up" id="pickedup" />
                <Label htmlFor="pickedup" className="ml-2">Picked Up</Label>
              </div>
              <div className="mb-2">
                <RadioGroupItem value="On the Way to drop location" id="ontheway" />
                <Label htmlFor="ontheway" className="ml-2">On the Way to drop location</Label>
              </div>
              <div className="mb-2">
                <RadioGroupItem value="Delivered" id="delivered" />
                <Label htmlFor="delivered" className="ml-2">Delivered</Label>
              </div>
            </RadioGroup>
            <div className="mt-4">
              <Label htmlFor="statusNote">Note (optional)</Label>
              <Textarea
                id="statusNote"
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                placeholder="Add a note (optional)"
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleStatusChange}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
              >
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PickupDetail;
