
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const dailyEarnings = [
  { day: 'Mon', amount: 350 },
  { day: 'Tue', amount: 420 },
  { day: 'Wed', amount: 380 },
  { day: 'Thu', amount: 450 },
  { day: 'Fri', amount: 520 },
  { day: 'Sat', amount: 580 },
  { day: 'Sun', amount: 490 }
];

const weeklyEarnings = [
  { week: 'Week 1', amount: 2450 },
  { week: 'Week 2', amount: 2600 },
  { week: 'Week 3', amount: 2800 },
  { week: 'Week 4', amount: 3100 }
];

const monthlyEarnings = [
  { month: 'Jan', amount: 9800 },
  { month: 'Feb', amount: 10500 },
  { month: 'Mar', amount: 11200 },
  { month: 'Apr', amount: 10800 },
  { month: 'May', amount: 12000 }
];

const transactionHistory = [
  { id: 'TXN001', date: '12 May 2025', amount: 1200, type: 'settlement', status: 'completed' },
  { id: 'TXN002', date: '05 May 2025', amount: 950, type: 'settlement', status: 'completed' },
  { id: 'TXN003', date: '28 Apr 2025', amount: 1150, type: 'settlement', status: 'completed' },
  { id: 'TXN004', date: '21 Apr 2025', amount: 1080, type: 'settlement', status: 'completed' },
  { id: 'TXN005', date: '14 Apr 2025', amount: 990, type: 'settlement', status: 'completed' }
];

const DeliveryEarnings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  
  // Redirect if not authenticated or not delivery partner
  if (!isAuthenticated || user?.role !== 'delivery') {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/delivery/dashboard')} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">My Earnings</h1>
        </div>
        <div>
          <button
            onClick={() => navigate('/delivery/notifications')}
            className="p-2 relative"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-app-primary rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>
      
      <div className="p-4 pb-20">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today's Earnings</CardDescription>
              <CardTitle>₹490</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+8% from yesterday</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Week</CardDescription>
              <CardTitle>₹3,100</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+11% from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Earnings Summary</CardTitle>
              <CardDescription>Month of May 2025</CardDescription>
            </div>
            <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+10%</span>
            </div>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-lg font-semibold">74</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Avg. Order Value</p>
                  <p className="text-lg font-semibold">₹42</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Distance</p>
                  <p className="text-lg font-semibold">320 km</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Tips</p>
                  <p className="text-lg font-semibold">₹420</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="daily" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Daily Earnings</CardTitle>
                <CardDescription>Your earnings for the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyEarnings} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Amount']} 
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="amount" fill="#4f46e5" barSize={30} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="weekly" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Earnings</CardTitle>
                <CardDescription>Your earnings for the past 4 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyEarnings} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Amount']} 
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="amount" fill="#4f46e5" barSize={40} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly" className="p-0">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings</CardTitle>
                <CardDescription>Your earnings for the past 5 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyEarnings} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Amount']} 
                        labelFormatter={(label) => `${label}`}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactionHistory.map((transaction, index) => (
                <div key={transaction.id}>
                  <div className="flex justify-between items-center py-1">
                    <div>
                      <p className="font-medium">Payment #{transaction.id}</p>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{transaction.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{transaction.amount.toLocaleString()}</p>
                      <span className={`text-xs ${
                        transaction.status === 'completed' 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {transaction.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  {index < transactionHistory.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4">View All Payments</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
        <button 
          onClick={() => navigate('/delivery/dashboard')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <Wallet className="w-6 h-6" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        
        <button 
          onClick={() => navigate('/delivery/orders')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <Wallet className="w-6 h-6" />
          <span className="text-xs mt-1">Deliveries</span>
        </button>
        
        <button 
          onClick={() => navigate('/delivery/earnings')}
          className="flex flex-col items-center p-2 text-app-primary"
        >
          <Wallet className="w-6 h-6" />
          <span className="text-xs mt-1">Earnings</span>
        </button>
        
        <button 
          onClick={() => navigate('/delivery/profile')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <Wallet className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryEarnings;
