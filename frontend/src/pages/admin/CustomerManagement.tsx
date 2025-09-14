import React, { useState, useEffect } from 'react';
import { Search, Eye, ToggleLeft, ToggleRight, History, Truck, CreditCard, PlusCircle } from 'lucide-react';
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
import { toast } from '@/utils/toast';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BACKEND_URL } from '@/utils/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = `${BACKEND_URL}/api`;

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [pickupHistoryOpen, setPickupHistoryOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false); // <-- Add state for details dialog
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [pickupHistory, setPickupHistory] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [disablePaymentModalOpen, setDisablePaymentModalOpen] = useState(false);
  const [enablePaymentModalOpen, setEnablePaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedEnablePaymentMethod, setSelectedEnablePaymentMethod] = useState<string>('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [enableLoading, setEnableLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch customers and payment methods from backend
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/customers');
        setCustomers(res.data || []);
      } catch (err) {
        toast.error('Failed to fetch customers');
        setCustomers([]);
      }
      setLoading(false);
    };
    const fetchPaymentMethods = async () => {
      try {
        const res = await axios.get('/api/admin/payment-methods');
        setPaymentMethods(res.data || []);
      } catch (err) {
        setPaymentMethods([]);
      }
    };
    fetchCustomers();
    fetchPaymentMethods();
  }, []);

  // Filter customers based on search query and status
  const filteredCustomers = customers.filter(customer => {
    const matchesQuery =
      (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone || '').includes(searchQuery);

    if (filterStatus === 'all') return matchesQuery;
    if (filterStatus === 'active') return matchesQuery && customer.status === 'active';
    if (filterStatus === 'inactive') return matchesQuery && customer.status === 'inactive';

    return matchesQuery;
  });

  // Toggle customer status (activate/deactivate)
  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      await axios.patch(`/api/admin/customers/${id}/activate`);
      setCustomers(prev =>
        prev.map(customer =>
          customer._id === id
            ? { ...customer, status: customer.status === 'active' ? 'inactive' : 'active' }
            : customer
        )
      );
      toast.success(`Customer Account ${currentStatus === 'active' ? 'Deactivated' : 'Activated'}`);
    } catch (err) {
      toast.error('Failed to update customer status');
    }
  };

  // Fetch order history for a customer
  const openOrderHistory = async (customer: any) => {
    setSelectedCustomer(customer);
    setOrderHistory([]);
    setHistoryLoading(true);
    setOrderHistoryOpen(true);
    try {
      const res = await axios.get(`/api/admin/customers/${customer._id}/orders`);
      setOrderHistory(res.data.orders || []);
    } catch {
      toast.error('Failed to fetch order history');
    }
    setHistoryLoading(false);
  };

  // Fetch pickup history for a customer
  const openPickupHistory = async (customer: any) => {
    setSelectedCustomer(customer);
    setPickupHistory([]);
    setHistoryLoading(true);
    setPickupHistoryOpen(true);
    try {
      const res = await axios.get(`/api/admin/customers/${customer._id}/pickups`);
      setPickupHistory(res.data.pickups || []);
    } catch {
      toast.error('Failed to fetch pickup history');
    }
    setHistoryLoading(false);
  };

  // Open customer details dialog
  const openCustomerDetails = (customer: any) => {
    setSelectedCustomer(customer);
    setDetailsOpen(true);
  };

  // Open disable payment method dialog
  const openDisablePaymentModal = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedPaymentMethod('');
    setDisablePaymentModalOpen(true);
  };

  // Open enable payment method dialog
  const openEnablePaymentModal = (customer: any) => {
    setSelectedCustomer(customer);
    setSelectedEnablePaymentMethod('');
    setEnablePaymentModalOpen(true);
  };

  // Handle disable payment method
  const handleDisablePayment = async () => {
    if (!selectedPaymentMethod || !selectedCustomer) return;
    setDisableLoading(true);
    try {
      await axios.patch(`/api/admin/customers/${selectedCustomer._id}/disable-payment-method`, {
        paymentMethod: selectedPaymentMethod,
      });
      toast.success('Payment method disabled for customer');
      setDisablePaymentModalOpen(false);
    } catch (err) {
      toast.error('Failed to disable payment method');
    }
    setDisableLoading(false);
  };

  // Handle enable payment method
  const handleEnablePayment = async () => {
    if (!selectedEnablePaymentMethod || !selectedCustomer) return;
    setEnableLoading(true);
    try {
      await axios.patch(`/api/admin/customers/${selectedCustomer._id}/enable-payment-method`, {
        paymentMethod: selectedEnablePaymentMethod,
      });
      toast.success('Payment method enabled for customer');
      setEnablePaymentModalOpen(false);
    } catch (err) {
      toast.error('Failed to enable payment method');
    }
    setEnableLoading(false);
  };

  // Handle export report
  const handleExportReport = () => {
    const doc = new jsPDF();
    doc.text('Customers Report', 14, 16);

    const tableColumn = [
      'Name',
      'Email',
      'Phone',
      'Customer ID',
      'Status',
      'Joined',
      'Total Orders',
      'Total Spent'
    ];
    const tableRows = filteredCustomers.map(customer => [
      customer.name || '-',
      customer.email || '-',
      customer.phone || '-',
      customer._id || '-',
      customer.status || '-',
      customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-',
      customer.totalOrders ?? '-',
      typeof customer.totalSpent === 'number' ? `₹${customer.totalSpent.toFixed(2)}` : '₹0.00'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 9 }
    });

    doc.save('customers_report.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Button onClick={handleExportReport} variant="outline">
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Customers</CardTitle>
          <CardDescription>View customer information and manage account status.</CardDescription>
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
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
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
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">
                        <div>
                          {customer.name}
                          <p className="text-xs text-gray-500">{customer.email}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                          <p className="text-xs text-gray-400">ID: {customer._id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {customer.totalOrders ?? '-'}
                      </TableCell>
                      <TableCell>
                        ₹{customer.totalSpent ? customer.totalSpent.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell>
                        {customer.status === 'active' ? (
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
                            onClick={() => openCustomerDetails(customer)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStatus(customer._id, customer.status)}
                            title={customer.status === 'active' ? "Deactivate" : "Activate"}
                          >
                            {customer.status === 'active' ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openOrderHistory(customer)}
                            title="View Order History"
                          >
                            <History className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPickupHistory(customer)}
                            title="View Pickup History"
                          >
                            <Truck className="h-4 w-4 text-orange-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDisablePaymentModal(customer)}
                            title="Disable Payment Method"
                          >
                            <CreditCard className="h-4 w-4 text-rose-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEnablePaymentModal(customer)}
                            title="Enable Payment Method"
                          >
                            <PlusCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View detailed information about the customer.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Name:</span> {selectedCustomer.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {selectedCustomer.email || <span className="text-gray-400">N/A</span>}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {selectedCustomer.phone}
              </div>
              <div>
                <span className="font-semibold">Customer ID:</span> {selectedCustomer._id}
              </div>
              <div>
                <span className="font-semibold">Status:</span>{' '}
                {selectedCustomer.status === 'active' ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-red-500 border-red-500">Inactive</Badge>
                )}
              </div>
              <div>
                <span className="font-semibold">Joined:</span>{' '}
                {selectedCustomer.createdAt
                  ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                  : '-'}
              </div>
              <div>
                <span className="font-semibold">Total Orders:</span> {selectedCustomer.totalOrders ?? '-'}
              </div>
              <div>
                <span className="font-semibold">Total Spent:</span> ₹{selectedCustomer.totalSpent ? selectedCustomer.totalSpent.toFixed(2) : '0.00'}
              </div>
              {/* Add more fields if needed */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order History Dialog */}
      <Dialog open={orderHistoryOpen} onOpenChange={setOrderHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order History</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? selectedCustomer.name : ''} ({selectedCustomer ? selectedCustomer.email : ''})
            </DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : orderHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders found.</div>
          ) : (
            // Add max-h-[70vh] and overflow-y-auto for scroll
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderHistory.map((order: any) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNumber || order._id}</TableCell>
                      <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>₹{order.finalAmount ? order.finalAmount.toFixed(2) : '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pickup History Dialog */}
      <Dialog open={pickupHistoryOpen} onOpenChange={setPickupHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pickup History</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? selectedCustomer.name : ''} ({selectedCustomer ? selectedCustomer.email : ''})
            </DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : pickupHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pickups found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pickup ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pickup Address</TableHead>
                    <TableHead>Drop Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickupHistory.map((pickup: any) => (
                    <TableRow key={pickup._id}>
                      <TableCell>{pickup._id}</TableCell>
                      <TableCell>{pickup.createdAt ? new Date(pickup.createdAt).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{pickup.status}</TableCell>
                      <TableCell>{pickup.pickupAddress}</TableCell>
                      <TableCell>{pickup.dropAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Payment Method Dialog */}
      <Dialog open={disablePaymentModalOpen} onOpenChange={setDisablePaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Payment Method</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? (
                <>
                  Disable a payment method for <b>{selectedCustomer.name}</b>
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Select Payment Method</label>
              <div className="space-y-2">
                {paymentMethods.length === 0 ? (
                  <div className="text-gray-400 text-sm">No payment methods found.</div>
                ) : (
                  paymentMethods.map((pm) => (
                    <label key={pm._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm._id}
                        checked={selectedPaymentMethod === pm._id}
                        onChange={() => setSelectedPaymentMethod(pm._id)}
                        disabled={disableLoading}
                      />
                      <span>{pm.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDisablePaymentModalOpen(false)}
                disabled={disableLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisablePayment}
                disabled={!selectedPaymentMethod || disableLoading}
              >
                Disable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enable Payment Method Dialog */}
      <Dialog open={enablePaymentModalOpen} onOpenChange={setEnablePaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Payment Method</DialogTitle>
            <DialogDescription>
              {selectedCustomer ? (
                <>
                  Enable a payment method for <b>{selectedCustomer.name}</b>
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Select Payment Method</label>
              <div className="space-y-2">
                {paymentMethods.length === 0 ? (
                  <div className="text-gray-400 text-sm">No payment methods found.</div>
                ) : (
                  paymentMethods.map((pm) => (
                    <label key={pm._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="enablePaymentMethod"
                        value={pm._id}
                        checked={selectedEnablePaymentMethod === pm._id}
                        onChange={() => setSelectedEnablePaymentMethod(pm._id)}
                        disabled={enableLoading}
                      />
                      <span>{pm.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEnablePaymentModalOpen(false)}
                disabled={enableLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnablePayment}
                disabled={!selectedEnablePaymentMethod || enableLoading}
              >
                Enable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
