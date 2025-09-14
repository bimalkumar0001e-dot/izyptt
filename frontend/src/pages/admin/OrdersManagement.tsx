import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, CreditCard, Banknote, CheckCircle, AlertCircle, Truck, Package, Loader, X } from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton'; // If you have a Skeleton loader component
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import axios from 'axios';
import { BACKEND_URL } from '@/utils/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Fix import

const API_BASE = `${BACKEND_URL}/api`;

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'canceled';

const statusOptions = [
  { value: 'preparing', label: 'Preparing Order' },
  { value: 'packing', label: 'Packing' },
  { value: 'packed', label: 'Packed' },
  { value: 'assigning_rider', label: 'Assigning Rider' },
  { value: 'picked', label: 'Picked' },
  { value: 'on_the_way', label: 'On the Way' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'delayed_high_demand', label: 'Delayed – High Demand' },
  { value: 'delayed_weather', label: 'Delayed – Weather' },
  { value: 'delayed_rider_assigned_late', label: 'Rider Assigned Late' },
  { value: 'delayed_rider_unavailable', label: 'Delayed – Rider Unavailable' },
  { value: 'cancelled_by_customer', label: 'Cancelled by Customer' },
  { value: 'cancelled_by_admin', label: 'Cancelled by Admin' },
  { value: 'cancelled_payment_failed', label: 'Cancelled – Payment Failed' },
  { value: 'delivery_failed_wrong_address', label: 'Delivery Failed – Wrong Address' },
  { value: 'delivery_failed_no_response', label: 'Delivery Failed – No Response' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'refund_issued', label: 'Refund Issued' }
];

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // <-- Add date filter state
  const navigate = useNavigate();
  
  // State for assign delivery partner dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState<string | null>(null);
  
  // New state for update status dialog
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [cancelReason, setCancelReason] = useState('');
  
  // New state for order details dialog
  const [orderDetailsDialogOpen, setOrderDetailsDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  
  // Admin fee/tax state
  const [adminDeliveryFee, setAdminDeliveryFee] = useState<number | null>(null);
  const [adminHandlingCharge, setAdminHandlingCharge] = useState<number | null>(null);
  const [adminGstTax, setAdminGstTax] = useState<number | null>(null);

  // New state for delete order dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);

  // Fetch orders and delivery partners from backend
  useEffect(() => {
    fetchOrders();
    fetchDeliveryPartners();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/admin/delivery-fee`)
      .then(res => res.json())
      .then((fees) => {
        const activeFee = Array.isArray(fees)
          ? fees.find((fee: any) => fee.isActive)
          : null;
        if (activeFee) setAdminDeliveryFee(activeFee.amount);
        else setAdminDeliveryFee(0);
      })
      .catch(() => setAdminDeliveryFee(0));

    fetch(`${API_BASE}/admin/handling-charge`)
      .then(res => res.json())
      .then((charges) => {
        const activeCharge = Array.isArray(charges)
          ? charges.find((charge: any) => charge.isActive)
          : null;
        if (activeCharge) setAdminHandlingCharge(activeCharge.amount);
        else setAdminHandlingCharge(0);
      })
      .catch(() => setAdminHandlingCharge(0));

    fetch(`${API_BASE}/admin/gst-taxes`)
      .then(res => res.json())
      .then((taxes) => {
        const activeTax = Array.isArray(taxes)
          ? taxes.find((tax: any) => tax.isActive)
          : null;
        if (activeTax) setAdminGstTax(activeTax.percentage || activeTax.amount || 0);
        else setAdminGstTax(0);
      })
      .catch(() => setAdminGstTax(0));
  }, []);

  const fetchOrders = async () => {
    try {
      // Verify token before making request
      const headers = getAuthHeaders();
      
      // If no headers were returned (no token), exit early
      if (!Object.keys(headers).length) {
        console.error('No auth token available to fetch orders');
        return;
      }
      
      console.log('Fetching orders with headers:', headers);
      const res = await axios.get(`${API_BASE}/admin/orders`, { 
        headers: headers,
        withCredentials: true
      });
      
      console.log('Orders fetched successfully:', res.data.length || 0, 'orders');
      setOrders(res.data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      console.error('Response data:', err.response?.data);
      toast.error(`Failed to fetch orders: ${err.response?.data?.message || err.message}`);
      setOrders([]);
    }
  };

  const fetchDeliveryPartners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/delivery-boys`, { headers: getAuthHeaders() });
      setDeliveryPartners(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch delivery partners');
      setDeliveryPartners([]);
    }
  };

  // Filter orders based on search query, status, and date
  const filteredOrders = orders.filter(order => {
    const matchesQuery =
      (order.orderNumber || order._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.restaurant?.restaurantDetails?.name || order.restaurant?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter) {
      const orderDate = new Date(order.createdAt);
      const selectedDate = new Date(dateFilter);
      matchesDate =
        orderDate.getFullYear() === selectedDate.getFullYear() &&
        orderDate.getMonth() === selectedDate.getMonth() &&
        orderDate.getDate() === selectedDate.getDate();
    }

    return matchesQuery && matchesStatus && matchesDate;
  });
  
  // Function to handle assigning a delivery partner to an order
  const openAssignDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSelectedDeliveryPartnerId(null);
    setAssignDialogOpen(true);
  };
  
  const handleAssignDeliveryPartner = async () => {
    if (!selectedOrderId || !selectedDeliveryPartnerId) return;
    try {
      await axios.patch(
        `${API_BASE}/admin/orders/${selectedOrderId}/assign-delivery`,
        { deliveryPartnerId: selectedDeliveryPartnerId },
        { headers: getAuthHeaders() }
      );
      toast.success('Delivery partner assigned');
      setAssignDialogOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to assign delivery partner');
    }
  };

  const getAuthHeaders = () => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Check if token exists
    if (!token) {
      console.warn('No auth token found in localStorage');
      // Ask user to login again if no token found
      toast.error('Authentication required. Please log in again.');
      return {};
    }
    
    // Log token for debugging
    console.log('Using token for auth:', token.substring(0, 10) + '...');
    
    // Return headers with token
    return { Authorization: `Bearer ${token}` };
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderId || !newStatus) return;
    try {
      if (newStatus.includes('cancel')) {
        await axios.patch(
          `${API_BASE}/admin/orders/${selectedOrderId}/cancel`,
          { reason: cancelReason },
          { headers: getAuthHeaders() }
        );
        toast.success('Order canceled');
      } else {
        try {
          // Force a token refresh by getting it directly before the call
          const token = localStorage.getItem('token');
          if (!token) {
            toast.error('No authentication token found. Please log in again.');
            return;
          }
          
          // Make sure we're using the right API URL for the environment
          const API_URL = BACKEND_URL + '/api';
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          };
          
          console.log('Making request with:');
          console.log('- URL:', `${API_URL}/admin/orders/${selectedOrderId}/status`);
          console.log('- Headers:', headers);
          console.log('- Payload:', { status: newStatus });
          
          // Important: use xsrfHeaderName: false and withCredentials: false for cross-domain requests
          const response = await axios({
            method: 'PATCH',
            url: `${API_URL}/admin/orders/${selectedOrderId}/status`,
            data: { status: newStatus },
            headers: headers,
            withCredentials: false,
            xsrfHeaderName: false
          });
          
          console.log('Status update response:', response.data);
          toast.success('Order status updated successfully');
        } catch (err: any) {
          console.error('Status update error:', err);
          console.error('Error response:', err.response);
          toast.error(`Update failed: ${err.response?.data?.message || err.message || 'Unknown error'}`);
          throw err;
        }
      }
      setUpdateStatusDialogOpen(false);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  // Fetch order details and open modal
  const openOrderDetailsDialog = async (orderId: string) => {
    setOrderDetailsDialogOpen(true);
    setOrderDetailsLoading(true);
    setOrderDetails(null);
    try {
      const res = await axios.get(`${API_BASE}/admin/orders/${orderId}`, { headers: getAuthHeaders() });
      setOrderDetails(res.data);
    } catch (err) {
      toast.error('Failed to fetch order details');
      setOrderDetails(null);
    }
    setOrderDetailsLoading(false);
  };

  // Map backend status to display label and color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return <Badge className="bg-amber-500">Placed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmed</Badge>;
      case 'preparing':
        return <Badge className="bg-purple-500">Preparing</Badge>;
      case 'packing':
        return <Badge className="bg-blue-400">Packing</Badge>;
      case 'packed':
        return <Badge className="bg-blue-500">Packed</Badge>;
      case 'ready':
        return <Badge className="bg-blue-500">Ready</Badge>;
      case 'picked':
        return <Badge className="bg-indigo-500">Picked</Badge>;
      case 'out_for_delivery':
        return <Badge className="bg-indigo-500">Out for Delivery</Badge>;
      case 'on_the_way':
        return <Badge className="bg-indigo-600">On the Way</Badge>;
      case 'delayed':
        return <Badge className="bg-yellow-600">Delayed</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'cancelled':
      case 'canceled':
        return <Badge variant="outline" className="text-red-500 border-red-500">Canceled</Badge>;
      // Add all admin statuses
      case 'delayed_high_demand':
        return <Badge className="bg-yellow-600">Delayed – High Demand</Badge>;
      case 'delayed_weather':
        return <Badge className="bg-yellow-600">Delayed – Weather</Badge>;
      case 'delayed_rider_assigned_late':
        return <Badge className="bg-yellow-600">Rider Assigned Late</Badge>;
      case 'delayed_rider_unavailable':
        return <Badge className="bg-yellow-600">Delayed – Rider Unavailable</Badge>;
      case 'cancelled_by_customer':
        return <Badge variant="outline" className="text-red-500 border-red-500">Cancelled by Customer</Badge>;
      case 'cancelled_by_admin':
        return <Badge variant="outline" className="text-red-500 border-red-500">Cancelled by Admin</Badge>;
      case 'cancelled_payment_failed':
        return <Badge variant="outline" className="text-red-500 border-red-500">Cancelled – Payment Failed</Badge>;
      case 'delivery_failed_wrong_address':
        return <Badge variant="outline" className="text-red-500 border-red-500">Delivery Failed – Wrong Address</Badge>;
      case 'delivery_failed_no_response':
        return <Badge variant="outline" className="text-red-500 border-red-500">Delivery Failed – No Response</Badge>;
      case 'on_hold':
        return <Badge className="bg-gray-400">On Hold</Badge>;
      case 'refund_issued':
        return <Badge className="bg-green-400">Refund Issued</Badge>;
      default:
        // Show the actual status string, capitalized and spaced
        const formatted =
          status && typeof status === 'string'
            ? status
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
            : 'Unknown';
        return <Badge className="bg-gray-500">{formatted}</Badge>;
    }
  };

  const getPaymentBadge = (method: string) => {
    switch (method) {
      case 'Credit Card':
      case 'Online Payment':
        return (
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-1 text-blue-500" />
            <span className="text-sm">Paid</span>
          </div>
        );
      case 'Cash on Delivery':
        return (
          <div className="flex items-center">
            <Banknote className="h-4 w-4 mr-1 text-green-500" />
            <span className="text-sm">COD</span>
          </div>
        );
      default:
        return <span className="text-sm">{method}</span>;
    }
  };

  // Add this function:
  const openUpdateStatusDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setNewStatus('');
    setCancelReason('');
    setUpdateStatusDialogOpen(true);
  };

  // Helper to calculate total for an order (same as OrderConfirmation)
  const calculateOrderTotal = (order: any) => {
    let subtotal = 0;
    let discount = 0;
    if (order && order.items) {
      subtotal = order.items.reduce(
        (sum: number, item: any) =>
          sum + ((item.price ?? 0) * (item.quantity ?? 1)),
        0
      );
      discount = order.discount || 0;
    }
    const deliveryFeeToShow = adminDeliveryFee !== null ? adminDeliveryFee : (order?.deliveryFee ?? 0);
    const handlingChargeToShow = adminHandlingCharge !== null ? adminHandlingCharge : 0;
    const gstTaxToShow = adminGstTax !== null ? (subtotal * adminGstTax / 100) : (order?.tax ?? 0);
    const total =
      subtotal +
      deliveryFeeToShow +
      gstTaxToShow +
      handlingChargeToShow -
      discount;
    return total;
  };

  // Export PDF handler
  const handleExportReport = () => {
    const doc = new jsPDF();
    doc.text('Orders Report', 14, 16);

    // Prepare table data
    const tableColumn = [
      'S.No.', // Add serial number column
      'Order ID',
      'Customer',
      'Phone', // Added phone column
      'Restaurant',
      'Date',
      'Amount',
      'Items', // Added items column
      'Status'
    ];
    const tableRows = filteredOrders.map((order, idx) => [
      idx + 1, // Serial number
      order.orderNumber ? `#${order.orderNumber}` : (order._id ? `#${order._id}` : '-'),
      order.customer?.name || '-',
      order.customer?.phone || order.customerPhone || '-', // Phone
      (order.restaurant?.restaurantDetails?.name || order.restaurant?.name || '-'),
      order.createdAt ? new Date(order.createdAt).toLocaleString() : '-',
      typeof order.finalAmount === 'number' && !isNaN(order.finalAmount)
        ? `₹${Math.ceil(order.finalAmount)}`
        : typeof order.totalAmount === 'number' && !isNaN(order.totalAmount)
        ? `₹${Math.ceil(order.totalAmount)}`
        : 'N/A',
      Array.isArray(order.items)
        ? order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')
        : '-', // Items
      order.status
    ]);

    // Add summary row for total orders and total amount
    const totalAmount = filteredOrders.reduce((sum, order) => {
      if (typeof order.finalAmount === 'number' && !isNaN(order.finalAmount)) {
        return sum + Math.ceil(order.finalAmount);
      } else if (typeof order.totalAmount === 'number' && !isNaN(order.totalAmount)) {
        return sum + Math.ceil(order.totalAmount);
      }
      return sum;
    }, 0);
    tableRows.push([
      '', '', '', '', '', 'Total Orders', `${filteredOrders.length}`, `₹${totalAmount}`, ''
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 9 }
    });

    doc.save('orders_report.pdf');
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await axios.delete(`${API_BASE}/admin/orders/${orderToDelete._id}`, { headers: getAuthHeaders() });
      toast.success('Order deleted successfully');
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <Button onClick={handleExportReport} variant="outline">
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>View and manage customer orders across all restaurants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by order ID, customer, or restaurant"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                value={statusFilter} 
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="placed">Placed</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="picked">Picked</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="on_the_way">On the Way</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              {/* Date filter input */}
              <Input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Partner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      {/* Order ID */}
                      <TableCell className="font-medium">
                        {order.orderNumber ? `#${order.orderNumber}` : (order._id ? `#${order._id}` : '-')}
                      </TableCell>
                      {/* Customer Name */}
                      <TableCell>
                        {order.customer && order.customer.name ? order.customer.name : 'null'}
                      </TableCell>
                      {/* Restaurant Name */}
                      <TableCell>
                        {order.restaurant && (order.restaurant.restaurantDetails?.name || order.restaurant.name)
                          ? (order.restaurant.restaurantDetails?.name || order.restaurant.name)
                          : 'null'}
                      </TableCell>
                      {/* Date */}
                      <TableCell>
                        <div>
                          {order.createdAt ? (
                            <>
                              {new Date(order.createdAt).toLocaleDateString()}
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </>
                          ) : (
                            '-'
                          )}
                        </div>
                      </TableCell>
                      {/* Amount */}
                      <TableCell>
                        {typeof order.finalAmount === 'number' && !isNaN(order.finalAmount)
                          ? <>₹{Math.ceil(order.finalAmount)}</>
                          : typeof order.totalAmount === 'number' && !isNaN(order.totalAmount)
                          ? <>₹{Math.ceil(order.totalAmount)}</>
                          : <span className="text-gray-400">N/A</span>
                        }
                      </TableCell>
                      {/* Payment */}
                      <TableCell>
                        {getPaymentBadge(order.paymentMethod)}
                      </TableCell>
                      {/* Status */}
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      {/* Delivery Partner */}
                      <TableCell>
                        {order.deliveryPartner && order.deliveryPartner.name
                          ? order.deliveryPartner.name
                          : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openAssignDialog(order._id)}
                              disabled={
                                order.status === 'delivered' ||
                                order.status === 'canceled' ||
                                order.status === 'cancelled'
                              }
                            >
                              Assign Partner
                            </Button>
                          )
                        }
                      </TableCell>
                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openOrderDetailsDialog(order._id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            {/* Only show Change Status... */}
                            <DropdownMenuItem 
                              onClick={() => openUpdateStatusDialog(order._id)}
                            >
                              <Loader className="h-4 w-4 mr-2 text-yellow-500" />
                              Change Status...
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { setOrderToDelete(order); setDeleteDialogOpen(true); }} className="text-red-600">
                              <X className="h-4 w-4 mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Assign Delivery Partner Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner to assign to this order
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select onValueChange={(value) => setSelectedDeliveryPartnerId(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a delivery partner" />
              </SelectTrigger>
              <SelectContent>
                {deliveryPartners
                  .filter(dp => dp.status === 'active' && dp.isApproved)
                  .map(partner => (
                    <SelectItem key={partner._id} value={partner._id}>
                      {partner.name} (Rating: 4.5)
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
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
      
      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'canceled' ? 'Cancel Order' : 'Update Order Status'}
            </DialogTitle>
            <DialogDescription>
              {newStatus === 'canceled' 
                ? 'Please provide a reason for cancellation'
                : 'Select a new status for this order'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <Select 
              value={newStatus} 
              onValueChange={(value) => setNewStatus(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(newStatus.startsWith('cancelled') || newStatus === 'delivery_failed_wrong_address' || newStatus === 'delivery_failed_no_response') && (
              <div>
                <label htmlFor="cancel-reason" className="block text-sm font-medium mb-1">
                  Reason
                </label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Please specify the reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="resize-none"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateOrderStatus} 
              disabled={!newStatus || ((typeof newStatus === 'string' && newStatus.startsWith('cancelled')) || newStatus === 'delivery_failed_wrong_address' || newStatus === 'delivery_failed_no_response') && !cancelReason.trim()}
              variant={newStatus.startsWith('cancelled') ? 'destructive' : 'default'}
            >
              {newStatus.startsWith('cancelled') ? 'Cancel Order' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsDialogOpen} onOpenChange={setOrderDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {/* No extra description needed */}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            {orderDetailsLoading ? (
              <div>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </div>
            ) : orderDetails ? (
              <div>
                <div className="mb-2">
                  <span className="font-bold">Order #:</span> {orderDetails.orderNumber || orderDetails._id}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Status:</span> {orderDetails.status?.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Customer:</span> {orderDetails.customer?.name || '-'}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Phone:</span> {orderDetails.customer?.phone || orderDetails.customerPhone || '-'}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Delivery Partner:</span> {orderDetails.deliveryPartner?.name || '-'}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Delivery Address:</span>{" "}
                  {orderDetails.deliveryAddress
                    ? `${orderDetails.deliveryAddress.address || ''}${orderDetails.deliveryAddress.landmark ? ', ' + orderDetails.deliveryAddress.landmark : ''}${orderDetails.deliveryAddress.city ? ', ' + orderDetails.deliveryAddress.city : ''}${orderDetails.deliveryAddress.state ? ', ' + orderDetails.deliveryAddress.state : ''}${orderDetails.deliveryAddress.pincode ? ' - ' + orderDetails.deliveryAddress.pincode : ''}`.replace(/^,\s*/, '')
                    : orderDetails.address || orderDetails.deliveryAddress || "-"}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Payment Mode:</span> {orderDetails.paymentMethod}
                </div>
                <div className="mb-2">
                  <span className="font-bold">Total:</span> {typeof orderDetails.finalAmount === 'number' && !isNaN(orderDetails.finalAmount)
                    ? <>₹{Math.ceil(orderDetails.finalAmount)}</>
                    : typeof orderDetails.totalAmount === 'number' && !isNaN(orderDetails.totalAmount)
                    ? <>₹{Math.ceil(orderDetails.totalAmount)}</>
                    : <span className="text-gray-400">N/A</span>
                  }
                </div>
                <div className="mb-2">
                  <span className="font-bold">Items:</span>
                  <ul className="list-disc ml-6 mt-1">
                    {orderDetails.items?.map((item: any, idx: number) => (
                      <li key={idx}>
                        {item.quantity}x {item.name} - ₹{item.total?.toFixed(2) || item.price?.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                {orderDetails.statusTimeline && orderDetails.statusTimeline.length > 0 && (
                  <div className="mb-2">
                    <span className="font-bold">Status Timeline:</span>
                    <ul className="list-disc ml-6 mt-1 text-xs text-gray-600">
                      {orderDetails.statusTimeline.map((st: any, idx: number) => (
                        <li key={idx}>
                          {st.status?.replace(/_/g, ' ').toUpperCase()} - {new Date(st.timestamp).toLocaleString()}
                          {st.note && <> ({st.note})</>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {orderDetails.cancellationReason && (
                  <div className="mb-2">
                    <span className="font-bold text-red-500">Cancellation Reason:</span> {orderDetails.cancellationReason}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No details found.</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-2">
              <span className="font-bold">Order #:</span> {orderToDelete?.orderNumber || orderToDelete?._id}
            </div>
            <div className="mb-2">
              <span className="font-bold">Customer:</span> {orderToDelete?.customer?.name || '-'}
            </div>
            <div className="mb-2">
              <span className="font-bold">Amount:</span> ₹{orderToDelete?.finalAmount || orderToDelete?.totalAmount || '-'}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
