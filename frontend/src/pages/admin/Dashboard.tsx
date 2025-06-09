import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Store, Truck, Coins, Settings, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { faker } from '@faker-js/faker';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/utils/toast';
import axios from 'axios';
import { useNotifications } from '@/contexts/NotificationContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [siteStatus, setSiteStatus] = useState<string>("online");
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const { unreadCount } = useNotifications();

  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState<{
    customers: number;
    restaurants: number;
    deliveryPartners: number;
    orders: number;
  }>({ customers: 0, restaurants: 0, deliveryPartners: 0, orders: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Show loading state if still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-primary"></div>
      </div>
    );
  }

  // Fetch system status on mount
  useEffect(() => {
    setStatusLoading(true);
    axios.get('/api/admin/system-status')
      .then(res => {
        setSiteStatus(res.data.status || "online");
      })
      .catch(() => {
        toast.error("Failed to fetch system status");
      })
      .finally(() => setStatusLoading(false));
  }, []);

  // Fetch dashboard statistics on mount
  useEffect(() => {
    setStatsLoading(true);
    axios.get('/api/admin/dashboard')
      .then(res => {
        setDashboardStats({
          customers: res.data.customers ?? 0,
          restaurants: res.data.restaurants ?? 0,
          deliveryPartners: res.data.deliveryPartners ?? 0,
          orders: res.data.orders ?? 0
        });
      })
      .catch(() => {
        toast.error("Failed to fetch dashboard statistics");
      })
      .finally(() => setStatsLoading(false));
  }, []);

  // Mock data for dashboard
  // const totalCustomers = 50;
  // const totalRestaurants = 15;
  // const totalDeliveryPartners = 20;
  // const totalRevenue = 50000;
  
  // Create mock order data for the chart
  const orders = Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 1}`,
    totalAmount: Math.floor(Math.random() * 300) + 100,
    createdAt: new Date(faker.date.past())
  }));

  // Sort orders by date for the chart
  const sortedOrders = [...orders].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  // Format data for recharts
  const chartData = sortedOrders.map(order => ({
    name: order.createdAt.toLocaleDateString(),
    amount: order.totalAmount,
  }));

  // Handle site status change
  const handleSiteStatusChange = async (value: string) => {
    setStatusUpdating(true);
    try {
      await axios.put('/api/admin/system-status', { status: value });
      setSiteStatus(value);
      toast.success(`Site status changed to ${value}`);
    } catch {
      toast.error("Failed to update site status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle store open/close
  const handleStoreToggle = (checked: boolean) => {
    setIsStoreOpen(checked);
    toast.success(checked ? 'Store is now open' : 'Store is now closed');
  };
  
  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin')} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </div>
        {/* Notification bell icon */}
        <button
          onClick={() => navigate('/admin/notifications')}
          className="relative p-2 rounded-full hover:bg-gray-100"
          aria-label="View notifications"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </header>
      
      <div className="p-4 pb-16">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Website Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site-status">Site Status</Label>
                <Select 
                  value={siteStatus} 
                  onValueChange={handleSiteStatusChange}
                  disabled={statusLoading || statusUpdating}
                >
                  <SelectTrigger id="site-status">
                    <SelectValue placeholder={statusLoading ? "Loading..." : "Select status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="maintenance">Maintenance Mode</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
                {(statusLoading || statusUpdating) && (
                  <span className="text-xs text-gray-400">Updating...</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="store-status" className="flex flex-col space-y-1">
                  <span>Store Status</span>
                  <span className="font-normal text-xs text-muted-foreground">Allow customers to place orders</span>
                </Label>
                <Switch 
                  id="store-status" 
                  checked={isStoreOpen} 
                  onCheckedChange={handleStoreToggle} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <span className="animate-pulse">--</span> : dashboardStats.customers}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Restaurants
              </CardTitle>
              <Store className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <span className="animate-pulse">--</span> : dashboardStats.restaurants}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delivery Partners
              </CardTitle>
              <Truck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? <span className="animate-pulse">--</span> : dashboardStats.deliveryPartners}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <Coins className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold whitespace-nowrap">
                {statsLoading ? <span className="animate-pulse">--</span> : dashboardStats.orders}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent Activities</h2>
          <ul className="space-y-3">
            <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <Avatar className="mr-3">
                  <AvatarImage src="https://i.pravatar.cc/150?img=5" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">New customer <span className="text-app-primary">Charlie Neo</span> registered</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            </li>
            
            <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <Avatar className="mr-3">
                  <AvatarImage src="https://i.pravatar.cc/150?img=9" />
                  <AvatarFallback>SO</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Restaurant <span className="text-app-primary">Spice Origin</span> added new menu items</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </li>
            
            <li className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center">
                <Avatar className="mr-3">
                  <AvatarImage src="https://i.pravatar.cc/150?img=12" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Delivery partner <span className="text-app-primary">John Doe</span> marked order as delivered</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
