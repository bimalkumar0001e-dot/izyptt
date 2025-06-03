import React, { useState, useEffect } from 'react';
import { Search, Eye, Truck, MapPin, Package, Calendar, Clock, Phone, User, Pencil, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { BACKEND_URL } from '@/utils/utils';
import axios from 'axios';
axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;

type PickupStatus = string;

interface PickupRequest {
  _id: string;
  customer?: { name: string; phone?: string };
  pickupAddress: string;
  dropAddress: string;
  itemType: string;
  note?: string;
  createdAt: string;
  status: PickupStatus;
  deliveryBoy?: { name: string; phone?: string };
  totalAmount?: number;
  cancelReason?: string;
}

const statusOptions = [
  'Pending',
  'Assigned',
  'Assigning delivery partner',
  'Accepted',
  'Reached pickup location',
  'Picked Up',
  'On the Way',
  'On the Way to drop location',
  'Reached drop location',
  'Delivered',
  'Cancelled'
];

const PickupManagement: React.FC = () => {
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [isUpdatePriceDialogOpen, setIsUpdatePriceDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [priceInput, setPriceInput] = useState<string>('');
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState<string>('');

  // Fetch pickups and delivery partners from backend
  useEffect(() => {
    fetchPickups();
    fetchDeliveryPartners();
  }, []);

  const fetchPickups = async () => {
    try {
      const res = await axios.get('/api/admin/pickups');
      setPickupRequests(res.data || []);
    } catch {
      toast({ title: "Failed to fetch pickups", variant: "destructive" });
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const res = await axios.get('/api/admin/delivery-boys');
      setDeliveryPartners(res.data || []);
    } catch {
      toast({ title: "Failed to fetch delivery partners", variant: "destructive" });
    }
  };

  // Filter pickup requests
  const filteredRequests = pickupRequests.filter(request => {
    const matchesSearch =
      (request.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.pickupAddress || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.dropAddress || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && request.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!selectedRequest || !selectedStatus) return;
    try {
      if (selectedStatus.toLowerCase() === 'cancelled' && !cancellationReason.trim()) {
        toast({ title: "Please provide a reason for cancellation", variant: "destructive" });
        return;
      }
      if (selectedStatus.toLowerCase() === 'cancelled') {
        await axios.patch(`/api/admin/pickups/${selectedRequest._id}/cancel`, { reason: cancellationReason });
      } else {
        await axios.patch(`/api/admin/pickups/${selectedRequest._id}/status`, { status: selectedStatus });
      }
      toast({ title: "Status Updated", description: `Pickup status updated to ${selectedStatus}` });
      setIsUpdateStatusDialogOpen(false);
      setCancellationReason('');
      fetchPickups();
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  // Handle update price
  const handleUpdatePrice = async () => {
    if (!selectedRequest) return;
    const price = Number(priceInput);
    if (isNaN(price) || price < 0) {
      toast({ title: "Enter a valid price", variant: "destructive" });
      return;
    }
    try {
      await axios.patch(`/api/admin/pickups/${selectedRequest._id}/amount`, { totalAmount: price });
      toast({ title: "Price Updated", description: `Pickup price updated to ₹${price}` });
      setIsUpdatePriceDialogOpen(false);
      fetchPickups();
    } catch {
      toast({ title: "Failed to update price", variant: "destructive" });
    }
  };

  // Assign delivery partner to pickup
  const handleAssignDeliveryPartner = async () => {
    if (!selectedRequest || !selectedDeliveryPartnerId) return;
    try {
      const res = await axios.patch(`/api/admin/pickups/${selectedRequest._id}/assign`, {
        deliveryBoyId: selectedDeliveryPartnerId
      });
      toast({ title: "Delivery Partner Assigned" });
      setIsAssignDialogOpen(false);
      setSelectedDeliveryPartnerId('');
      // Update the pickup in the list with the returned populated pickup
      if (res.data && res.data.pickup) {
        setPickupRequests((prev) =>
          prev.map((p) => (p._id === res.data.pickup._id ? res.data.pickup : p))
        );
      } else {
        fetchPickups();
      }
    } catch {
      toast({ title: "Failed to assign delivery partner", variant: "destructive" });
    }
  };

  // Get status badge (show as-is if not mapped)
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    if (s === 'assigned') return <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>;
    if (s === 'accepted') return <Badge className="bg-blue-100 text-blue-800">Accepted</Badge>;
    if (s === 'reached pickup location' || s === 'reached_pickup_location')
      return <Badge className="bg-purple-100 text-purple-800">Reached Pickup</Badge>;
    if (s === 'picked up' || s === 'picked' || s === 'picked_up')
      return <Badge className="bg-indigo-100 text-indigo-800">Picked Up</Badge>;
    if (s === 'on the way to drop location' || s === 'on_the_way' || s === 'on_the_way_to_drop_location')
      return <Badge className="bg-purple-100 text-purple-800">On the Way</Badge>;
    if (s === 'reached drop location' || s === 'reached_drop_location')
      return <Badge className="bg-green-100 text-green-800">Reached Drop Location</Badge>;
    if (s === 'delivered') return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
    if (s === 'cancelled') return <Badge variant="outline" className="text-red-800 border-red-300">Cancelled</Badge>;
    // fallback: show status as-is
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pickup Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pickup Requests</CardTitle>
          <CardDescription>
            View and manage all pickup and drop requests from customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by ID, customer, or address"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pickup ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Delivery Partner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">{request._id}</TableCell>
                      <TableCell>{request.customer?.name || '-'}</TableCell>
                      <TableCell>{request.itemType}</TableCell>
                      <TableCell>
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '-'}
                        <br />
                        <span className="text-xs text-gray-500">
                          {request.createdAt ? new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>₹{request.totalAmount ?? 0}</TableCell>
                      <TableCell>
                        {request.deliveryBoy && request.deliveryBoy.name ? (
                          <span>{request.deliveryBoy.name}</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setSelectedDeliveryPartnerId('');
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            Assign Partner
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setSelectedStatus(request.status);
                              setIsUpdateStatusDialogOpen(true);
                            }}
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setPriceInput(String(request.totalAmount ?? ''));
                              setIsUpdatePriceDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* Remove assign button from here */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      No pickup requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Pickup Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pickup Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">#{selectedRequest._id}</h3>
                {getStatusBadge(selectedRequest.status)}
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{selectedRequest.customer?.name || '-'}</p>
                    <p className="text-sm text-gray-500">{selectedRequest.customer?.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pickup Address</p>
                    <p className="text-sm">{selectedRequest.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Drop Address</p>
                    <p className="text-sm">{selectedRequest.dropAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{selectedRequest.itemType}</p>
                    <p className="text-sm">{selectedRequest.note}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Created On</p>
                    <p className="text-sm">
                      {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleDateString() : '-'}{' '}
                      {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
                {selectedRequest.deliveryBoy && (
                  <div className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-sm">{selectedRequest.deliveryBoy.name}</p>
                      <p className="text-sm text-gray-500">{selectedRequest.deliveryBoy.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Estimated Price</p>
                    <p className="text-xl font-semibold">₹{selectedRequest.totalAmount ?? 0}</p>
                  </div>
                </div>
                {selectedRequest.cancelReason && (
                  <div>
                    <span className="font-semibold text-red-500">Cancel Reason:</span> {selectedRequest.cancelReason}
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Pickup Status</DialogTitle>
            <DialogDescription>
              Change the status of this pickup request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                <div className="font-medium">Pickup ID:</div>
                <div>{selectedRequest._id}</div>
                <div className="font-medium">Current Status:</div>
                <div>{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStatus.toLowerCase() === 'cancelled' && (
                <div className="space-y-2">
                  <label htmlFor="cancel-reason" className="block text-sm font-medium">
                    Reason for Cancellation
                  </label>
                  <Input
                    id="cancel-reason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Enter reason for cancellation"
                    required
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Update Price Dialog */}
      <Dialog open={isUpdatePriceDialogOpen} onOpenChange={setIsUpdatePriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Pickup Price</DialogTitle>
            <DialogDescription>
              Set a new price for this pickup request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <span className="font-medium">Pickup ID:</span> {selectedRequest._id}
              </div>
              <div>
                <Input
                  type="number"
                  min={0}
                  value={priceInput}
                  onChange={e => setPriceInput(e.target.value)}
                  placeholder="Enter new price"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdatePriceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrice}>Update Price</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Assign Delivery Partner Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner to assign to this pickup
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedDeliveryPartnerId} onValueChange={setSelectedDeliveryPartnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a delivery partner" />
              </SelectTrigger>
              <SelectContent>
                {deliveryPartners
                  .filter(dp => dp.status === 'active' && dp.isApproved)
                  .map(partner => (
                    <SelectItem key={partner._id} value={partner._id}>
                      {partner.name} ({partner.phone || 'No phone'})
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignDeliveryPartner} 
              disabled={!selectedDeliveryPartnerId}
            >
              Assign Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PickupManagement;
