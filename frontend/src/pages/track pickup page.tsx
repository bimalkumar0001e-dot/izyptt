import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { ArrowDown } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const API_BASE = "http://localhost:5001/api";

// Define the real status progression in order
const statusSteps = [
  "Pending", // Assigning Delivery Partner
  "Picked Up",
  "On the Way to drop location",
  "Delivered"
];

const statusLabels: Record<string, string> = {
  "Pending": "Assigning Delivery Partner",
  "Picked Up": "Picked Up",
  "On the Way to drop location": "On the Way to Drop Location",
  "Delivered": "Delivered"
};

const normalizeStatus = (status: string) => {
  if (!status) return "";
  const s = status.toLowerCase();
  if (s.includes("pending")) return "Pending";
  if (s.includes("picked")) return "Picked Up";
  if (s.includes("on the way") || s.includes("on_the_way")) return "On the Way to drop location";
  if (s.includes("delivered")) return "Delivered";
  if (s.includes("cancel")) return "Cancelled";
  return status;
};

const PickupTrackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchPickup = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API_BASE}/customer/pickup-drop/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPickup(res.data);
    } catch {
      setPickup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickup();
    // eslint-disable-next-line
  }, [id]);

  const handleCancelPickup = async () => {
    if (!window.confirm("Are you sure you want to cancel this pickup?")) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE}/customer/pickup-drop/${pickup._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Pickup cancelled",
        description: "Your pickup has been cancelled.",
      });
      // Refresh pickup status
      fetchPickup();
    } catch {
      toast({
        title: "Failed to cancel pickup",
        description: "Please try again.",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <AppHeader title="Track Pickup" showBackButton />
        <div className="flex-1 flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (!pickup) {
    return (
      <div className="app-container">
        <AppHeader title="Track Pickup" showBackButton />
        <div className="flex-1 flex items-center justify-center text-red-500">Pickup not found.</div>
      </div>
    );
  }

  // Determine current step index
  const normalizedStatus = normalizeStatus(pickup.status);
  let currentStep = statusSteps.findIndex(s => s === normalizedStatus);
  if (normalizedStatus === "Cancelled") currentStep = -1;

  return (
    <div className="app-container">
      <AppHeader title="Track Pickup" showBackButton />
      <div className="flex-1 p-4 pb-28 flex justify-center items-start">
        <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">Pickup Status</h2>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-base text-gray-500">Pickup Location:</span>
              <span className="text-base font-semibold text-right text-gray-700">{pickup.pickupAddress}</span>
            </div>
            <div className="flex justify-center my-2">
              <ArrowDown className="text-app-primary w-7 h-7" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-500">Drop Location:</span>
              <span className="text-base font-semibold text-right text-gray-700">{pickup.dropAddress}</span>
            </div>
          </div>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-base text-gray-500">Task Type:</span>
            <span className="text-base font-semibold">{pickup.itemType}</span>
          </div>
          {/* Status Stepper */}
          <div className="my-8">
            <div className="flex flex-col gap-5">
              {statusSteps.map((step, idx) => (
                <div key={step} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shadow
                    ${idx <= currentStep
                      ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white"
                      : "bg-gray-200 text-gray-400"}
                  `}>
                    {idx + 1}
                  </div>
                  <span className={`font-semibold text-lg ${idx <= currentStep ? "text-orange-500" : "text-gray-400"}`}>
                    {statusLabels[step]}
                  </span>
                </div>
              ))}
              {pickup.status === "Cancelled" && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-base bg-red-500 text-white shadow">
                    X
                  </div>
                  <span className="font-semibold text-lg text-red-500">Cancelled</span>
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <span className="text-base text-gray-500">Current Status: </span>
            <span className="text-base font-bold text-gray-800">{pickup.status}</span>
          </div>
          {/* Cancel Pickup Button */}
          {pickup.status !== "Delivered" && pickup.status !== "Cancelled" && (
            <div className="flex justify-end mt-8">
              <Button
                variant="destructive"
                disabled={cancelling}
                className="px-8 py-2 rounded-lg text-base font-semibold shadow"
                onClick={handleCancelPickup}
              >
                {cancelling ? "Cancelling..." : "Cancel Pickup"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PickupTrackPage;
