import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowDown, Truck } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const MyPickups: React.FC = () => {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPickups = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/customer/pickup-drop/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPickups(res.data || []);
      } catch {
        setPickups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, []);

  const activePickups = pickups.filter(
    (p) => p.status !== "Delivered" && p.status !== "Cancelled"
  );
  const pastPickups = pickups.filter(
    (p) => p.status === "Delivered" || p.status === "Cancelled"
  );

  return (
    <div className="app-container">
      <AppHeader title="My Pickups" showBackButton />
      <div className="flex-1 p-4 pb-24">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="active">Active Pickups</TabsTrigger>
            <TabsTrigger value="past">Past Pickups</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {loading ? (
              <div className="flex justify-center py-12">Loading...</div>
            ) : activePickups.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <Truck className="w-12 h-12 mb-2" />
                <div>No active pickups</div>
                <div className="text-sm text-gray-400 mt-1">Your active pickups will appear here</div>
              </div>
            ) : (
              <div className="space-y-4">
                {activePickups.map((pickup) => (
                  <div
                    key={pickup._id}
                    className="bg-white rounded-xl shadow border border-gray-100 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-app-primary">{pickup.itemType}</span>
                      <span className="text-xs text-gray-500">{new Date(pickup.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Pickup Location:</span>
                      <span className="text-sm font-medium text-right">{pickup.pickupAddress}</span>
                    </div>
                    <div className="flex justify-center my-1">
                      <ArrowDown className="text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Drop Location:</span>
                      <span className="text-sm font-medium text-right">{pickup.dropAddress}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      <span className="text-xs font-medium">{pickup.status}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Amount:</span>
                      <span className="text-xs font-medium">{pickup.totalAmount != null ? `₹${pickup.totalAmount}` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Pickup ID:</span>
                      <span className="text-xs font-mono">{pickup._id}</span>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        className="bg-app-primary text-white"
                        onClick={() => navigate(`/pickup-track/${pickup._id}`)}
                      >
                        Track Pickup
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="past">
            {loading ? (
              <div className="flex justify-center py-12">Loading...</div>
            ) : pastPickups.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-500">
                <Truck className="w-12 h-12 mb-2" />
                <div>No past pickups</div>
                <div className="text-sm text-gray-400 mt-1">Your delivered or cancelled pickups will appear here</div>
              </div>
            ) : (
              <div className="space-y-4">
                {pastPickups.map((pickup) => (
                  <div
                    key={pickup._id}
                    className="bg-white rounded-xl shadow border border-gray-100 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-app-primary">{pickup.itemType}</span>
                      <span className="text-xs text-gray-500">{new Date(pickup.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Pickup Location:</span>
                      <span className="text-sm font-medium text-right">{pickup.pickupAddress}</span>
                    </div>
                    <div className="flex justify-center my-1">
                      <ArrowDown className="text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Drop Location:</span>
                      <span className="text-sm font-medium text-right">{pickup.dropAddress}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Status:</span>
                      <span className={`text-xs font-medium ${pickup.status === "Delivered" ? "text-green-600" : "text-red-500"}`}>{pickup.status}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Amount:</span>
                      <span className="text-xs font-medium">{pickup.totalAmount != null ? `₹${pickup.totalAmount}` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">Pickup ID:</span>
                      <span className="text-xs font-mono">{pickup._id}</span>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        className="bg-app-primary text-white"
                        onClick={() => navigate(`/pickup-track/${pickup._id}`)}
                      >
                        Track Pickup
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyPickups;
