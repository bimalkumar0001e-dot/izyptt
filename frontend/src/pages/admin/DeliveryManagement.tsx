import React, { useState, useEffect } from 'react';
import { Search, Eye, ToggleLeft, ToggleRight, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useNavigate } from 'react-router-dom';
import { showToast } from '@/utils/toast';
import { BACKEND_URL } from '@/utils/utils';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;

const DeliveryManagement: React.FC = () => {
  const [allPartners, setAllPartners] = useState<any[]>([]);
  const [pendingPartners, setPendingPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all partners and pending partners
  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        console.log('Fetching delivery partners...');
        const [allRes, pendingRes] = await Promise.all([
          axios.get('/api/admin/delivery-boys'),
          axios.get('/api/admin/pending-delivery-partners')
        ]);
        
        console.log('All partners API response:', allRes.data);
        console.log('Pending partners API response:', pendingRes.data);
        
        // Ensure array fallback
        const allPartnersData = Array.isArray(allRes.data) ? allRes.data : [];
        const pendingPartnersData = Array.isArray(pendingRes.data) ? pendingRes.data : [];
        
        setAllPartners(allPartnersData);
        setPendingPartners(pendingPartnersData);
        
        console.log('Filtered approved partners:', allPartnersData.filter(p => p.isApproved !== false));
        console.log('Filter status:', filterStatus);
      } catch (err) {
        console.error('Error fetching partners:', err);
        showToast('Failed to fetch delivery partners', 'error');
        setAllPartners([]); // fallback to empty array on error
        setPendingPartners([]);
      }
      setLoading(false);
    };
    fetchPartners();
  }, []);

  // Merge and filter partners for display
  const getFilteredPartners = () => {
    let partners: any[] = [];
    if (filterStatus === 'pending') {
      partners = pendingPartners;
    } else {
      // Remove pending from allPartners to avoid duplicates
      const approved = allPartners.filter(p => p.isApproved !== false);
      partners = filterStatus === 'all'
        ? [...approved, ...pendingPartners]
        : approved.filter(p =>
            (filterStatus === 'active' && p.status === 'active') ||
            (filterStatus === 'inactive' && p.status === 'inactive')
          );
    }
    
    // Search filter
    const filtered = partners.filter(partner =>
      (partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.phone?.includes(searchQuery))
    );
    
    console.log('Final filtered partners:', filtered);
    return filtered;
  };

  const filteredDeliveryPartners = getFilteredPartners();

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await axios.patch(`/api/admin/delivery-boys/${id}/activate`);
      setAllPartners(prev =>
        prev.map(partner =>
          partner._id === id
            ? { ...partner, status: currentStatus === 'active' ? 'inactive' : 'active' }
            : partner
        )
      );
      showToast(
        `Delivery Partner ${currentStatus === 'active' ? 'Deactivated' : 'Activated'}`,
        currentStatus === 'active' ? 'warning' : 'success'
      );
    } catch (err) {
      console.error('Error toggling status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  const approveDeliveryPartner = async (id: string) => {
    try {
      await axios.patch(`/api/admin/delivery-boys/${id}/approve`);
      
      // Remove from pending and add to all partners
      const partner = pendingPartners.find(p => p._id === id);
      if (partner) {
        setPendingPartners(prev => prev.filter(p => p._id !== id));
        setAllPartners(prev => [...prev, {...partner, isApproved: true, status: 'active'}]);
      }
      
      showToast('Delivery Partner Approved', 'success');
    } catch (err) {
      console.error('Error approving partner:', err);
      showToast('Failed to approve partner', 'error');
    }
  };

  const rejectDeliveryPartner = async (id: string) => {
    try {
      // You may want to implement a backend endpoint for rejection (deletion)
      await axios.delete(`/api/admin/delivery-boys/${id}`);
      setPendingPartners(prev => prev.filter(partner => partner._id !== id));
      setAllPartners(prev => prev.filter(partner => partner._id !== id));
      showToast('Delivery Partner Rejected', 'error');
    } catch (err) {
      console.error('Error rejecting partner:', err);
      showToast('Failed to reject partner', 'error');
    }
  };

  // Fetch delivery partner details
  const handleViewDetails = async (id: string) => {
    setShowModal(true);
    setDetailsLoading(true);
    setPartnerDetails(null);
    try {
      const res = await axios.get(`/api/admin/delivery-boys/${id}`);
      setPartnerDetails(res.data.deliveryBoy || res.data); // support both {deliveryBoy, orders} and direct
    } catch (err) {
      showToast('Failed to fetch partner details', 'error');
      setPartnerDetails(null);
    }
    setDetailsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Delivery Partner Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Delivery Partners</CardTitle>
          <CardDescription>View, activate, deactivate, or approve delivery partners.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by name, email, or phone"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? "default" : "outline"}
                onClick={() => setFilterStatus('all')}
                className="min-w-[80px]"
              >
                All
              </Button>
              <Button 
                variant={filterStatus === 'active' ? "default" : "outline"}
                onClick={() => setFilterStatus('active')}
                className="min-w-[80px]"
              >
                Active
              </Button>
              <Button 
                variant={filterStatus === 'inactive' ? "default" : "outline"}
                onClick={() => setFilterStatus('inactive')}
                className="min-w-[80px]"
              >
                Inactive
              </Button>
              <Button 
                variant={filterStatus === 'pending' ? "default" : "outline"}
                onClick={() => setFilterStatus('pending')}
                className="min-w-[80px]"
              >
                Pending
              </Button>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredDeliveryPartners.length > 0 ? (
                  filteredDeliveryPartners.map((partner) => (
                    <TableRow key={partner._id}>
                      <TableCell className="font-medium">
                        <div>
                          {partner.name}
                          <p className="text-xs text-gray-500">{partner.email}</p>
                          <p className="text-xs text-gray-500">{partner.phone}</p>
                          <p className="text-xs text-gray-400">ID: {partner._id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline">{partner.deliveryDetails?.vehicleType || 'N/A'}</Badge>
                          {/* Removed vehicle number/N/A below */}
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.isApproved ? partner.completedOrders || '0' : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {/* Hardcoded rating 4.5 for all delivery partners */}
                        {partner.isApproved ? (
                          <div className="flex items-center">
                            <span className="mr-1">4.5</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!partner.isApproved ? (
                          <Badge className="bg-amber-500">Pending Approval</Badge>
                        ) : partner.status === 'active' ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-500 border-red-500">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(partner._id)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {partner.isApproved ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleStatus(partner._id, partner.status)}
                              title={partner.status === 'active' ? "Deactivate" : "Activate"}
                            >
                              {partner.status === 'active' ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => approveDeliveryPartner(partner._id)}
                                className="text-green-500 hover:text-green-700"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => rejectDeliveryPartner(partner._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No delivery partners found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Delivery Partner Details */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery Partner Details</DialogTitle>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : partnerDetails ? (
            <div className="space-y-2">
              <div><b>Name:</b> {partnerDetails.name}</div>
              <div><b>Email:</b> {partnerDetails.email || '-'}</div>
              <div><b>Phone:</b> {partnerDetails.phone}</div>
              <div><b>Status:</b> {partnerDetails.status}</div>
              <div><b>Vehicle:</b> {partnerDetails.deliveryDetails?.vehicleType || '-'}</div>
              <div><b>Vehicle Number:</b> {partnerDetails.deliveryDetails?.vehicleNumber || '-'}</div>
              <div><b>Rating:</b> 4.5</div>
              <div><b>Orders Completed:</b> {partnerDetails.completedOrders || '0'}</div>
              {/* Add more fields as needed */}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No details found.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagement;