import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api/admin`;

const CartManagement: React.FC = () => {
  const [minCart, setMinCart] = useState<{
    amount: number;
    isActive: boolean;
    updatedAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch min cart amount on mount
  const fetchMinCart = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/min-cart-amount/view`);
      const data = await res.json();
      setMinCart(data && typeof data.amount === "number"
        ? { amount: data.amount, isActive: data.isActive ?? true, updatedAt: data.updatedAt }
        : null
      );
      setEditAmount(data.amount?.toString() || "");
    } catch {
      setMinCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMinCart();
  }, []);

  // Set min cart amount
  const handleSet = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/min-cart-amount/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ amount: Number(editAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Min cart amount set", description: `₹${editAmount}` });
        fetchMinCart();
        setEditMode(false);
      } else {
        toast({ title: "Error", description: data.message || "Failed to set min cart amount", variant: "destructive" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Update min cart amount
  const handleUpdate = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/min-cart-amount/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ amount: Number(editAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Min cart amount updated", description: `₹${editAmount}` });
        fetchMinCart();
        setEditMode(false);
      } else {
        toast({ title: "Error", description: data.message || "Failed to update min cart amount", variant: "destructive" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle activate/deactivate
  const handleToggle = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/min-cart-amount/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: data.message });
        fetchMinCart();
      } else {
        toast({ title: "Error", description: data.message || "Failed to toggle", variant: "destructive" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Delete min cart amount
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the minimum cart amount?")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/min-cart-amount`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token || ""}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Deleted", description: data.message });
        fetchMinCart();
        setEditMode(false);
      } else {
        toast({ title: "Error", description: data.message || "Failed to delete", variant: "destructive" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Minimum Cart Amount Management</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : minCart && typeof minCart.amount === "number" ? (
            <div>
              <div className="mb-4">
                <div className="text-lg font-semibold">
                  Current Min Cart Amount: <span className="text-app-primary">₹{minCart.amount}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Status:{" "}
                  <span className={minCart.isActive ? "text-green-600" : "text-red-600"}>
                    {minCart.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {minCart.updatedAt && (
                  <div className="text-xs text-gray-400 mt-1">
                    Last updated: {new Date(minCart.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
              {editMode ? (
                <div className="flex gap-2 mb-4">
                  <Input
                    type="number"
                    min={0}
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="w-40"
                  />
                  <Button onClick={handleUpdate} disabled={actionLoading || !editAmount}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditMode(false)} disabled={actionLoading}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <Button onClick={() => setEditMode(true)}>Edit</Button>
                  <Button
                    variant={minCart.isActive ? "destructive" : "default"}
                    onClick={handleToggle}
                    disabled={actionLoading}
                  >
                    {minCart.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="outline" onClick={handleDelete} disabled={actionLoading}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 text-gray-600">No minimum cart amount set.</div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="w-40"
                  placeholder="Enter amount"
                />
                <Button onClick={handleSet} disabled={actionLoading || !editAmount}>
                  Set
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CartManagement;
