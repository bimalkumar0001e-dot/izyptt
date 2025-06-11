import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/toast";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const ChargesTaxesFeesManagement: React.FC = () => {
  const [deliveryFees, setDeliveryFees] = useState<any[]>([]);
  const [handlingCharges, setHandlingCharges] = useState<any[]>([]);
  const [gstTaxes, setGstTaxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>("");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get("/api/admin/delivery-fee"),
      axios.get("/api/admin/handling-charge"),
      axios.get("/api/admin/gst-taxes"),
    ])
      .then(([deliveryRes, handlingRes, gstRes]) => {
        setDeliveryFees(deliveryRes.data || []);
        setHandlingCharges(handlingRes.data || []);
        setGstTaxes(gstRes.data || []);
      })
      .catch(() => {
        toast.error("Failed to fetch charges/taxes data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Actions ---
  const handleEditDeliveryFee = async (fee: any) => {
    const amountValue = prompt("Enter new delivery fee amount (₹):", fee.amount);
    if (amountValue === null) return;
    const amount = Number(amountValue);
    if (isNaN(amount) || amount < 0) return toast.error("Invalid amount");

    const minValue = prompt("Enter minimum subtotal for this fee (₹):", fee.minSubtotal ?? 0);
    if (minValue === null) return;
    const minSubtotal = Number(minValue);
    if (isNaN(minSubtotal) || minSubtotal < 0) return toast.error("Invalid min subtotal");

    const maxValue = prompt("Enter maximum subtotal for this fee (₹, leave blank for no upper limit):", fee.maxSubtotal ?? "");
    const maxSubtotal = maxValue === null || maxValue === "" ? undefined : Number(maxValue);
    if (maxValue !== "" && maxValue !== null && (isNaN(maxSubtotal!) || maxSubtotal! < minSubtotal)) return toast.error("Invalid max subtotal");

    setActionLoading(fee._id);
    try {
      await axios.put(`/api/admin/delivery-fee/${fee._id}`, { amount, minSubtotal, maxSubtotal });
      toast.success("Delivery fee updated");
      fetchAll();
    } catch {
      toast.error("Failed to update delivery fee");
    } finally {
      setActionLoading("");
    }
  };

  const handleToggleDeliveryFee = async (fee: any) => {
    setActionLoading(fee._id);
    try {
      await axios.patch(`/api/admin/delivery-fee/${fee._id}/activate`);
      toast.success("Delivery fee status updated");
      fetchAll();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading("");
    }
  };

  const handleEditHandlingCharge = async (charge: any) => {
    const value = prompt("Enter new handling charge amount (₹):", charge.amount);
    if (value === null) return;
    const amount = Number(value);
    if (isNaN(amount) || amount < 0) return toast.error("Invalid amount");
    setActionLoading(charge._id);
    try {
      await axios.put(`/api/admin/handling-charge/${charge._id}`, { amount });
      toast.success("Handling charge updated");
      fetchAll();
    } catch {
      toast.error("Failed to update handling charge");
    } finally {
      setActionLoading("");
    }
  };

  const handleToggleHandlingCharge = async (charge: any) => {
    setActionLoading(charge._id);
    try {
      await axios.patch(`/api/admin/handling-charge/${charge._id}/activate`);
      toast.success("Handling charge status updated");
      fetchAll();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading("");
    }
  };

  const handleEditGstTax = async (tax: any) => {
    const value = prompt("Enter new GST percentage:", tax.percentage ?? tax.rate ?? "");
    if (value === null) return;
    const percentage = Number(value);
    if (isNaN(percentage) || percentage < 0) return toast.error("Invalid percentage");
    setActionLoading(tax._id);
    try {
      await axios.put(`/api/admin/gst-taxes/${tax._id}`, { percentage });
      toast.success("GST/Tax updated");
      fetchAll();
    } catch {
      toast.error("Failed to update GST/Tax");
    } finally {
      setActionLoading("");
    }
  };

  const handleToggleGstTax = async (tax: any) => {
    setActionLoading(tax._id);
    try {
      await axios.patch(`/api/admin/gst-taxes/${tax._id}/activate`);
      toast.success("GST/Tax status updated");
      fetchAll();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteDeliveryFee = async (fee: any) => {
    if (!window.confirm("Are you sure you want to delete this delivery fee?")) return;
    setActionLoading(fee._id);
    try {
      await axios.delete(`/api/admin/delivery-fee/${fee._id}`);
      toast.success("Delivery fee deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete delivery fee");
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteHandlingCharge = async (charge: any) => {
    if (!window.confirm("Are you sure you want to delete this handling charge?")) return;
    setActionLoading(charge._id);
    try {
      await axios.delete(`/api/admin/handling-charge/${charge._id}`);
      toast.success("Handling charge deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete handling charge");
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteGstTax = async (tax: any) => {
    if (!window.confirm("Are you sure you want to delete this GST/Tax?")) return;
    setActionLoading(tax._id);
    try {
      await axios.delete(`/api/admin/gst-taxes/${tax._id}`);
      toast.success("GST/Tax deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete GST/Tax");
    } finally {
      setActionLoading("");
    }
  };

  // Add new delivery fee
  const handleAddDeliveryFee = async () => {
    const amountValue = prompt("Enter delivery fee amount (₹):");
    if (amountValue === null) return;
    const amount = Number(amountValue);
    if (isNaN(amount) || amount < 0) return toast.error("Invalid amount");

    const minValue = prompt("Enter minimum subtotal for this fee (₹):", "0");
    if (minValue === null) return;
    const minSubtotal = Number(minValue);
    if (isNaN(minSubtotal) || minSubtotal < 0) return toast.error("Invalid min subtotal");

    const maxValue = prompt("Enter maximum subtotal for this fee (₹, leave blank for no upper limit):", "");
    const maxSubtotal = maxValue === null || maxValue === "" ? undefined : Number(maxValue);
    if (maxValue !== "" && maxValue !== null && (isNaN(maxSubtotal!) || maxSubtotal! < minSubtotal)) return toast.error("Invalid max subtotal");

    setActionLoading("add");
    try {
      await axios.post(`/api/admin/delivery-fee`, { amount, minSubtotal, maxSubtotal });
      toast.success("Delivery fee added");
      fetchAll();
    } catch {
      toast.error("Failed to add delivery fee");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Charges, Fees & Taxes Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delivery Fees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Delivery Fees</CardTitle>
            <Button
              size="sm"
              variant="default"
              onClick={handleAddDeliveryFee}
              disabled={actionLoading === "add"}
            >
              Add New
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse text-gray-400">Loading...</div>
            ) : deliveryFees.length === 0 ? (
              <div className="text-gray-400">No delivery fees found.</div>
            ) : (
              <ul className="space-y-2">
                {deliveryFees.map((fee) => (
                  <li key={fee._id} className="flex justify-between items-center border-b pb-1">
                    <span>
                      ₹{fee.amount}
                      <span className="text-xs text-gray-500 ml-2">
                        (₹{fee.minSubtotal ?? 0}
                        {typeof fee.maxSubtotal === "number" ? ` - ₹${fee.maxSubtotal}` : " & above"})
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${fee.isActive ? "text-green-600" : "text-red-500"}`}>
                        {fee.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === fee._id}
                        onClick={() => handleEditDeliveryFee(fee)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === fee._id}
                        onClick={() => handleToggleDeliveryFee(fee)}
                      >
                        {fee.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === fee._id}
                        onClick={() => handleDeleteDeliveryFee(fee)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* Handling Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Handling Charges</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse text-gray-400">Loading...</div>
            ) : handlingCharges.length === 0 ? (
              <div className="text-gray-400">No handling charges found.</div>
            ) : (
              <ul className="space-y-2">
                {handlingCharges.map((charge) => (
                  <li key={charge._id} className="flex justify-between items-center border-b pb-1">
                    <span>₹{charge.amount}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${charge.isActive ? "text-green-600" : "text-red-500"}`}>
                        {charge.isActive ? "Active" : "Inactive"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === charge._id}
                        onClick={() => handleEditHandlingCharge(charge)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading === charge._id}
                        onClick={() => handleToggleHandlingCharge(charge)}
                      >
                        {charge.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === charge._id}
                        onClick={() => handleDeleteHandlingCharge(charge)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* GST/Taxes */}
        <Card>
          <CardHeader>
            <CardTitle>GST / Taxes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse text-gray-400">Loading...</div>
            ) : gstTaxes.length === 0 ? (
              <div className="text-gray-400">No GST/taxes found.</div>
            ) : (
              <ul className="space-y-2">
                {gstTaxes.map((tax) => (
                  <li key={tax._id} className="flex flex-col border-b pb-1">
                    <div className="flex justify-between items-center">
                      <span>
                        {tax.name ? `${tax.name}: ` : ""}
                        {tax.percentage !== undefined
                          ? `${tax.percentage}%`
                          : tax.rate
                          ? `${tax.rate}%`
                          : `₹${tax.amount ?? ""}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${tax.isActive ? "text-green-600" : "text-red-500"}`}>
                          {tax.isActive ? "Active" : "Inactive"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === tax._id}
                          onClick={() => handleEditGstTax(tax)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === tax._id}
                          onClick={() => handleToggleGstTax(tax)}
                        >
                          {tax.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionLoading === tax._id}
                          onClick={() => handleDeleteGstTax(tax)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    {tax.description && (
                      <span className="text-xs text-gray-500">{tax.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
    </div>
  );
};

export default ChargesTaxesFeesManagement;
