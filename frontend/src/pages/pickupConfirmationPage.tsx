import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import axios from 'axios';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const PickupConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get(
      `${API_BASE}/customer/pickup-drop/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => setPickup(res.data))
      .catch(() => setPickup(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="app-container">
        <AppHeader title="Pickup Confirmation" showBackButton />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="app-container">
        <AppHeader title="Pickup Confirmation" showBackButton />
        <div className="flex-1 flex items-center justify-center text-red-500">Pickup not found.</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AppHeader title="Pickup Confirmation" showBackButton />
      <div className="flex-1 p-4 pb-28">
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Pickup Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your pickup has been booked. We'll assign a delivery partner shortly.</p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="font-medium mb-3">Pickup Details</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pickup From:</span>
                <span className="text-sm font-medium text-right">{pickup.pickupAddress || '-'}</span>
              </div>
              <div className="flex justify-center my-2">
                <ArrowDown className="text-gray-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Drop To:</span>
                <span className="text-sm font-medium text-right">{pickup.dropAddress || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Task Type:</span>
                <span className="text-sm font-medium">{pickup.itemType || '-'}</span>
              </div>
              {pickup.note && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Additional Details:</span>
                  <span className="text-sm">{pickup.note}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className="text-sm font-medium">{pickup.status || '-'}</span>
              </div>
            </div>
          </div>
        </div>
        {pickup._id && (
          <Button
            className="w-full bg-app-primary hover:bg-app-primary/90"
            onClick={() => navigate(`/pickup-track/${pickup._id}`)}
          >
            Track Pickup
          </Button>
        )}
      </div>
    </div>
  );
};

export default PickupConfirmationPage;
