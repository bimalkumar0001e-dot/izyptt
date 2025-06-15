import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/toast";
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const ChargesTaxesFeesManagement: React.FC = () => {
  const [deliveryFeeSections, setDeliveryFeeSections] = useState<any[]>([]);
  const [handlingCharges, setHandlingCharges] = useState<any[]>([]);
  const [gstTaxes, setGstTaxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>("");

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get("/api/admin/delivery-fee-sections"),
      axios.get("/api/admin/handling-charge"),
      axios.get("/api/admin/gst-taxes"),
    ])
      .then(([sectionsRes, handlingRes, gstRes]) => {
        setDeliveryFeeSections(sectionsRes.data || []);
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

  // --- Delivery Fee Section Actions ---
  const handleAddSection = async () => {
    const kmValue = prompt("Enter delivery distance (km):");
    if (kmValue === null) return;
    const km = Number(kmValue);
    if (isNaN(km) || km <= 0) return toast.error("Invalid km");
    setActionLoading("add-section");
    try {
      await axios.post(`/api/admin/delivery-fee-sections`, { km });
      toast.success("Section added");
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to add section");
    } finally {
      setActionLoading("");
    }
  };

  const handleEditSection = async (section: any) => {
    const kmValue = prompt("Edit delivery distance (km):", section.km);
    if (kmValue === null) return;
    const km = Number(kmValue);
    if (isNaN(km) || km <= 0) return toast.error("Invalid km");
    setActionLoading(section._id);
    try {
      await axios.put(`/api/admin/delivery-fee-sections/${section._id}`, { km });
      toast.success("Section updated");
      fetchAll();
    } catch {
      toast.error("Failed to update section");
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteSection = async (section: any) => {
    if (!window.confirm("Delete this section and all its fees?")) return;
    setActionLoading(section._id);
    try {
      await axios.delete(`/api/admin/delivery-fee-sections/${section._id}`);
      toast.success("Section deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete section");
    } finally {
      setActionLoading("");
    }
  };

  // --- Fee Slab Actions ---
  const handleAddFeeSlab = async (section: any) => {
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
    setActionLoading(section._id + "-add-fee");
    try {
      await axios.post(`/api/admin/delivery-fee-sections/${section._id}/fees`, { amount, minSubtotal, maxSubtotal });
      toast.success("Fee slab added");
      fetchAll();
    } catch {
      toast.error("Failed to add fee slab");
    } finally {
      setActionLoading("");
    }
  };

  const handleEditFeeSlab = async (section: any, fee: any) => {
    const amountValue = prompt("Edit delivery fee amount (₹):", fee.amount);
    if (amountValue === null) return;
    const amount = Number(amountValue);
    if (isNaN(amount) || amount < 0) return toast.error("Invalid amount");
    const minValue = prompt("Edit minimum subtotal for this fee (₹):", fee.minSubtotal ?? 0);
    if (minValue === null) return;
    const minSubtotal = Number(minValue);
    if (isNaN(minSubtotal) || minSubtotal < 0) return toast.error("Invalid min subtotal");
    const maxValue = prompt("Edit maximum subtotal for this fee (₹, leave blank for no upper limit):", fee.maxSubtotal ?? "");
    const maxSubtotal = maxValue === null || maxValue === "" ? undefined : Number(maxValue);
    if (maxValue !== "" && maxValue !== null && (isNaN(maxSubtotal!) || maxSubtotal! < minSubtotal)) return toast.error("Invalid max subtotal");
    setActionLoading(section._id + "-edit-fee-" + fee._id);
    try {
      await axios.put(`/api/admin/delivery-fee-sections/${section._id}/fees/${fee._id}`, { amount, minSubtotal, maxSubtotal });
      toast.success("Fee slab updated");
      fetchAll();
    } catch {
      toast.error("Failed to update fee slab");
    } finally {
      setActionLoading("");
    }
  };

  const handleToggleFeeSlab = async (section: any, fee: any) => {
    setActionLoading(section._id + "-toggle-fee-" + fee._id);
    try {
      await axios.put(`/api/admin/delivery-fee-sections/${section._id}/fees/${fee._id}`, { isActive: !fee.isActive });
      toast.success("Fee slab status updated");
      fetchAll();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading("");
    }
  };

  const handleDeleteFeeSlab = async (section: any, fee: any) => {
    if (!window.confirm("Delete this fee slab?")) return;
    setActionLoading(section._id + "-delete-fee-" + fee._id);
    try {
      await axios.delete(`/api/admin/delivery-fee-sections/${section._id}/fees/${fee._id}`);
      toast.success("Fee slab deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete fee slab");
    } finally {
      setActionLoading("");
    }
  };

  // --- Handling Charges ---
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

  // --- GST/Taxes ---
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

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Charges, Fees & Taxes Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delivery Fee Sections */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="animate-pulse text-gray-400">Loading...</div>
          ) : deliveryFeeSections.length === 0 ? (
            <div className="text-gray-400">No delivery fee sections found.</div>
          ) : (
            deliveryFeeSections.map((section) => (
              <Card key={section._id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Delivery Fees For {section.km} km</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleAddFeeSlab(section)} disabled={actionLoading === section._id + "-add-fee"}>Add New</Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditSection(section)} disabled={actionLoading === section._id}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSection(section)} disabled={actionLoading === section._id}>Delete</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {section.fees.length === 0 ? (
                    <div className="text-gray-400">No fee slabs found.</div>
                  ) : (
                    <ul className="space-y-2">
                      {section.fees.map((fee: any) => (
                        <li key={fee._id} className="flex justify-between items-center border-b pb-1">
                          <span>
                            ₹{fee.amount}
                            <span className="text-xs text-gray-500 ml-2">
                              (₹{fee.minSubtotal ?? 0}
                              {typeof fee.maxSubtotal === "number" ? ` - ₹${fee.maxSubtotal}` : " & above"})
                            </span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${fee.isActive ? "text-green-600" : "text-red-500"}`}>{fee.isActive ? "Active" : "Inactive"}</span>
                            <Button size="sm" variant="outline" disabled={actionLoading === section._id + "-edit-fee-" + fee._id} onClick={() => handleEditFeeSlab(section, fee)}>Edit</Button>
                            <Button size="sm" variant="outline" disabled={actionLoading === section._id + "-toggle-fee-" + fee._id} onClick={() => handleToggleFeeSlab(section, fee)}>{fee.isActive ? "Deactivate" : "Activate"}</Button>
                            <Button size="sm" variant="destructive" disabled={actionLoading === section._id + "-delete-fee-" + fee._id} onClick={() => handleDeleteFeeSlab(section, fee)}>Delete</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          <Button className="mt-2" onClick={handleAddSection} disabled={actionLoading === "add-section"}>Add New Section</Button>
        </div>
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
                      <span className={`text-xs ${charge.isActive ? "text-green-600" : "text-red-500"}`}>{charge.isActive ? "Active" : "Inactive"}</span>
                      <Button size="sm" variant="outline" disabled={actionLoading === charge._id} onClick={() => handleEditHandlingCharge(charge)}>Edit</Button>
                      <Button size="sm" variant="outline" disabled={actionLoading === charge._id} onClick={() => handleToggleHandlingCharge(charge)}>{charge.isActive ? "Deactivate" : "Activate"}</Button>
                      <Button size="sm" variant="destructive" disabled={actionLoading === charge._id} onClick={() => handleDeleteHandlingCharge(charge)}>Delete</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* GST / Taxes */}
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
                        <span className={`text-xs ${tax.isActive ? "text-green-600" : "text-red-500"}`}>{tax.isActive ? "Active" : "Inactive"}</span>
                        <Button size="sm" variant="outline" disabled={actionLoading === tax._id} onClick={() => handleEditGstTax(tax)}>Edit</Button>
                        <Button size="sm" variant="outline" disabled={actionLoading === tax._id} onClick={() => handleToggleGstTax(tax)}>{tax.isActive ? "Deactivate" : "Activate"}</Button>
                        <Button size="sm" variant="destructive" disabled={actionLoading === tax._id} onClick={() => handleDeleteGstTax(tax)}>Delete</Button>
                      </div>
                    </div>
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
