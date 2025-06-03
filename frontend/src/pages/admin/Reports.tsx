
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ArrowUpRight, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

// Mock data for sales report
const salesData = [
  { date: '2025-01-01', revenue: 12500, orders: 150 },
  { date: '2025-01-02', revenue: 10200, orders: 132 },
  { date: '2025-01-03', revenue: 15600, orders: 170 },
  { date: '2025-01-04', revenue: 13800, orders: 145 },
  { date: '2025-01-05', revenue: 18200, orders: 195 },
  { date: '2025-01-06', revenue: 16900, orders: 180 },
  { date: '2025-01-07', revenue: 14700, orders: 160 },
];

// Mock data for user activity
const activityData = [
  { day: 'Mon', newUsers: 24, activeUsers: 120, sessions: 180 },
  { day: 'Tue', newUsers: 18, activeUsers: 132, sessions: 190 },
  { day: 'Wed', newUsers: 25, activeUsers: 145, sessions: 205 },
  { day: 'Thu', newUsers: 32, activeUsers: 155, sessions: 230 },
  { day: 'Fri', newUsers: 30, activeUsers: 160, sessions: 240 },
  { day: 'Sat', newUsers: 43, activeUsers: 190, sessions: 280 },
  { day: 'Sun', newUsers: 40, activeUsers: 180, sessions: 260 },
];

// Mock data for performance metrics
const performanceData = [
  { name: 'Avg. Delivery Time', value: 28, unit: 'min', change: -2.5 },
  { name: 'Order Completion', value: 94.8, unit: '%', change: 1.2 },
  { name: 'Customer Satisfaction', value: 4.7, unit: '/5', change: 0.2 },
  { name: 'Menu Item Availability', value: 96.5, unit: '%', change: -0.5 },
];

// Mock revenue by category
const revenueByCategory = [
  { name: 'Food Orders', value: 68500 },
  { name: 'Pickup & Drop', value: 18200 },
  { name: 'Grocery', value: 12800 },
  { name: 'Other', value: 4500 },
];

// Mock order sources
const orderSourcesData = [
  { name: 'Mobile App', value: 65 },
  { name: 'Website', value: 25 },
  { name: 'Phone Call', value: 10 },
];

// Mock top customers
const topCustomersData = [
  {
    id: 'C001',
    name: 'Rahul Sharma',
    totalSpent: 8520,
    totalOrders: 32,
    lastOrder: '2025-01-05'
  },
  {
    id: 'C002',
    name: 'Priya Singh',
    totalSpent: 6240,
    totalOrders: 28,
    lastOrder: '2025-01-06'
  },
  {
    id: 'C003',
    name: 'Amit Kumar',
    totalSpent: 5960,
    totalOrders: 24,
    lastOrder: '2025-01-03'
  },
  {
    id: 'C004',
    name: 'Neha Gupta',
    totalSpent: 4520,
    totalOrders: 18,
    lastOrder: '2025-01-07'
  },
  {
    id: 'C005',
    name: 'Vikram Patel',
    totalSpent: 3950,
    totalOrders: 15,
    lastOrder: '2025-01-02'
  }
];

// Mock top products
const topProductsData = [
  {
    id: 'P001',
    name: 'Chicken Biryani',
    totalSold: 286,
    revenue: 68640,
    restaurant: 'Biryani House'
  },
  {
    id: 'P002',
    name: 'Paneer Butter Masala',
    totalSold: 198,
    revenue: 35640,
    restaurant: 'Punjabi Tadka'
  },
  {
    id: 'P003',
    name: 'Masala Dosa',
    totalSold: 175,
    revenue: 26250,
    restaurant: 'South Indian Delights'
  },
  {
    id: 'P004',
    name: 'Butter Chicken',
    totalSold: 150,
    revenue: 33000,
    restaurant: 'Punjabi Tadka'
  },
  {
    id: 'P005',
    name: 'Chocolate Brownie',
    totalSold: 142,
    revenue: 17040,
    restaurant: 'Sweet Treats'
  }
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  
  const handleExport = (reportType: string) => {
    toast({
      title: 'Export Started',
      description: `${reportType} report is being exported as CSV.`
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center space-x-2">
          <Select defaultValue="7d" onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base">Revenue</CardTitle>
              <CardDescription>Daily revenue from all services</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => handleExport('Revenue')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-base">Orders</CardTitle>
              <CardDescription>Daily order count</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={() => handleExport('Orders')}>
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} 
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Orders']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sales">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="platform">Platform Earnings</TabsTrigger>
        </TabsList>
        
        {/* Sales Report Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderSourcesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderSourcesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Customers</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport('Top Customers')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomersData.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.totalOrders}</TableCell>
                      <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>{new Date(customer.lastOrder).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Products</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport('Top Products')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Units Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductsData.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.restaurant}</TableCell>
                      <TableCell>{product.totalSold}</TableCell>
                      <TableCell>₹{product.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Activity Tab */}
        <TabsContent value="user-activity" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">User Activity Overview</CardTitle>
                <CardDescription>Daily active users and new registrations</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={() => handleExport('User Activity')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="newUsers" name="New Users" fill="#3b82f6" />
                    <Bar dataKey="activeUsers" name="Active Users" fill="#10b981" />
                    <Bar dataKey="sessions" name="Sessions" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceData.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </div>
                    <div className={`flex items-center text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit === '%' ? '%' : ''}
                      <ArrowUpRight className={`h-4 w-4 ml-1 ${metric.change < 0 ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Platform Earnings Tab */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base">Platform Earnings</CardTitle>
                <CardDescription>Revenue from commission and delivery fees</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={() => handleExport('Platform Earnings')}>
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} 
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${(value * 0.15).toFixed(2)}`, 'Platform Earnings']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      name="Platform Earnings (₹)"
                      // Transform the revenue to platform earnings (15% commission)
                      dot={{ stroke: '#3b82f6', fill: '#fff', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
