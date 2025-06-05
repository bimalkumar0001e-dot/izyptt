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
      <div className="flex-1 p-4 pb-28 flex justify-center items-start">
        <div className="w-full max-w-md bg-gradient-to-br from-orange-50 to-pink-50 border border-gray-200 rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4 text-orange-600 text-center">Pickup Confirmed!</h2>
          <div
            style={{
              height: "4px",
              width: "100%",
              borderRadius: "2px",
              margin: "12px 0 20px 0",
              background: "linear-gradient(90deg, rgba(99,102,241,0), #6366f1 20%, #ec4899 80%, rgba(236,72,153,0))"
            }}
          />
          <p className="text-gray-700 mb-2 text-center">Your pickup has been booked. We'll assign a delivery partner shortly.</p>
          <p className="text-gray-700 mb-6 text-center">Your pickup charge will be reflected on <span className="font-semibold text-orange-600">MY Pickup</span> page (usually 10rs) shortly.</p>
          <div className="bg-white/80 p-4 rounded-xl border border-gray-100 shadow mb-6">
            <h3 className="font-medium mb-3 text-pink-600">Pickup Details</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Pickup From:</span>
                <span className="text-sm font-semibold text-right text-orange-700">{pickup.pickupAddress || '-'}</span>
              </div>
              <div className="flex justify-center my-2">
                <ArrowDown className="text-pink-500 w-7 h-7" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Drop To:</span>
                <span className="text-sm font-semibold text-right text-pink-700">{pickup.dropAddress || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Task Type:</span>
                <span className="text-sm font-semibold text-indigo-700">{pickup.itemType || '-'}</span>
              </div>
              {pickup.note && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Additional Details:</span>
                  <span className="text-sm text-gray-700">{pickup.note}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Status:</span>
                <span className={
                  `text-sm font-semibold ${
                    pickup.status === 'Pending' ? 'text-orange-500' :
                    pickup.status === 'Completed' ? 'text-green-600' :
                    pickup.status === 'Failed' ? 'text-red-500' : 'text-gray-700'
                  }`
                }>
                  {pickup.status || '-'}
                </span>
              </div>
            </div>
          </div>
          {pickup._id && (
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-lg font-semibold py-3 rounded-lg shadow"
              onClick={() => navigate(`/pickup-track/${pickup._id}`)}
            >
              Track Pickup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupConfirmationPage;
