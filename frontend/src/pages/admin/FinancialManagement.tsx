
import React, { useState } from 'react';
import { Search, Eye, Download, ArrowDown, ArrowUp, CreditCard } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock transactions data
const mockTransactions = [
  {
    id: 't1',
    orderId: 'o1',
    customerName: 'John Doe',
    restaurantName: 'Tasty Bites',
    amount: 450.75,
    platformFee: 45.08,
    restaurantPayout: 405.67,
    paymentMethod: 'Credit Card',
    date: new Date('2025-05-10T12:30:00'),
    status: 'completed',
    type: 'order_payment'
  },
  {
    id: 't2',
    orderId: 'o2',
    customerName: 'Jane Smith',
    restaurantName: 'Spice Heaven',
    amount: 675.50,
    platformFee: 67.55,
    restaurantPayout: 607.95,
    paymentMethod: 'Online Payment',
    date: new Date('2025-05-10T13:15:00'),
    status: 'completed',
    type: 'order_payment'
  },
  {
    id: 't3',
    restaurantName: 'Burger Palace',
    amount: 4500.00,
    platformFee: 0,
    restaurantPayout: 4500.00,
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-05-09T14:00:00'),
    status: 'completed',
    type: 'restaurant_payout'
  },
  {
    id: 't4',
    deliveryPartnerName: 'Michael Johnson',
    amount: 2300.00,
    platformFee: 0,
    deliveryPartnerPayout: 2300.00,
    paymentMethod: 'Bank Transfer',
    date: new Date('2025-05-09T15:30:00'),
    status: 'completed',
    type: 'delivery_payout'
  },
  {
    id: 't5',
    orderId: 'o3',
    customerName: 'Bob Johnson',
    restaurantName: 'Burger Palace',
    amount: 320.25,
    platformFee: 32.03,
    restaurantPayout: 288.22,
    paymentMethod: 'Cash on Delivery',
    date: new Date('2025-05-10T14:00:00'),
    status: 'pending',
    type: 'order_payment'
  }
];

// Mock payout data
const mockPayouts = [
  {
    id: 'pay1',
    partnerName: 'Tasty Bites',
    partnerType: 'restaurant',
    amount: 5642.50,
    date: new Date('2025-05-08T10:00:00'),
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    accountDetails: 'XXXXXXXX1234'
  },
  {
    id: 'pay2',
    partnerName: 'Spice Heaven',
    partnerType: 'restaurant',
    amount: 4287.75,
    date: new Date('2025-05-07T11:30:00'),
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    accountDetails: 'XXXXXXXX5678'
  },
  {
    id: 'pay3',
    partnerName: 'Michael Johnson',
    partnerType: 'delivery',
    amount: 2300.00,
    date: new Date('2025-05-09T15:30:00'),
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    accountDetails: 'XXXXXXXX9012'
  },
  {
    id: 'pay4',
    partnerName: 'Sarah Williams',
    partnerType: 'delivery',
    amount: 1860.25,
    date: new Date('2025-05-06T14:15:00'),
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    accountDetails: 'XXXXXXXX3456'
  }
];

const FinancialManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions] = useState(mockTransactions);
  const [payouts] = useState(mockPayouts);
  const [transactionType, setTransactionType] = useState<'all' | 'order_payment' | 'restaurant_payout' | 'delivery_payout'>('all');
  const [payoutType, setPayoutType] = useState<'all' | 'restaurant' | 'delivery'>('all');
  
  const navigate = useNavigate();

  // Filter transactions based on search query and type
  const filteredTransactions = transactions.filter(transaction => {
    const searchFields = [
      transaction.id,
      transaction.orderId,
      transaction.customerName,
      transaction.restaurantName,
      transaction.deliveryPartnerName
    ].filter(Boolean).join(' ').toLowerCase();

    const matchesQuery = searchFields.includes(searchQuery.toLowerCase());

    if (transactionType === 'all') return matchesQuery;
    return matchesQuery && transaction.type === transactionType;
  });

  // Filter payouts based on search query and type
  const filteredPayouts = payouts.filter(payout => {
    const matchesQuery = payout.partnerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (payoutType === 'all') return matchesQuery;
    return matchesQuery && payout.partnerType === payoutType;
  });

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-500 border-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Management</h1>
        <Button onClick={() => navigate('/admin/finance/reports')}>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 text-sm font-medium ${
            activeTab === 'transactions'
              ? 'text-app-primary border-b-2 border-app-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`py-3 px-6 text-sm font-medium ${
            activeTab === 'payouts'
              ? 'text-app-primary border-b-2 border-app-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('payouts')}
        >
          Payouts
        </button>
      </div>

      {activeTab === 'transactions' ? (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View all financial transactions on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search transactions"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select 
                  value={transactionType} 
                  onValueChange={(value: any) => setTransactionType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="order_payment">Order Payments</SelectItem>
                    <SelectItem value="restaurant_payout">Restaurant Payouts</SelectItem>
                    <SelectItem value="delivery_payout">Delivery Payouts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Platform Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>
                          <div>
                            {transaction.date.toLocaleDateString()}
                            <p className="text-xs text-gray-500">
                              {transaction.date.toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.type === 'order_payment' ? (
                            <div className="flex items-center">
                              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                              <span>Order Payment</span>
                            </div>
                          ) : transaction.type === 'restaurant_payout' ? (
                            <div className="flex items-center">
                              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                              <span>Restaurant Payout</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                              <span>Delivery Payout</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>₹{transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>₹{transaction.platformFee.toFixed(2)}</TableCell>
                        <TableCell>
                          {getTransactionStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/finance/transactions/${transaction.id}`)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Partner Payouts</CardTitle>
            <CardDescription>View and manage payouts to restaurants and delivery partners.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search payouts"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select 
                  value={payoutType} 
                  onValueChange={(value: any) => setPayoutType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Partner type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Partners</SelectItem>
                    <SelectItem value="restaurant">Restaurants</SelectItem>
                    <SelectItem value="delivery">Delivery Partners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => navigate('/admin/finance/new-payout')}>
                <CreditCard className="mr-2 h-4 w-4" />
                New Payout
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payout ID</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.length > 0 ? (
                    filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.id}</TableCell>
                        <TableCell>{payout.partnerName}</TableCell>
                        <TableCell>
                          {payout.partnerType === 'restaurant' ? (
                            <Badge className="bg-purple-500">Restaurant</Badge>
                          ) : (
                            <Badge className="bg-blue-500">Delivery Partner</Badge>
                          )}
                        </TableCell>
                        <TableCell>₹{payout.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div>
                            {payout.date.toLocaleDateString()}
                            <p className="text-xs text-gray-500">
                              {payout.date.toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTransactionStatusBadge(payout.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/finance/payouts/${payout.id}`)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No payouts found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialManagement;
