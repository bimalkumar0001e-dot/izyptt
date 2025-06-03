import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Clock, Bell, Heart, ShoppingBag, User, ArrowLeft, Home, Truck, CreditCard, Percent } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockOrders } from '@/data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated or not customer
  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== 'customer') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Get recent orders
  const customerOrders = mockOrders
    .filter(order => order.customerId === user?.id)
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 3);
  
  if (!isAuthenticated || user?.role !== 'customer') {
    return null;
  }
  
  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Home</h1>
        </div>
        <div>
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-app-primary rounded-full"></span>
          </button>
        </div>
      </header>
      
      <div className="p-4 pb-16">
        <div className="bg-app-primary text-white p-4 rounded-xl mb-6">
          <h2 className="text-xl font-semibold">Welcome, {user?.name}</h2>
          <p className="opacity-90">What would you like to order today?</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            <button 
              onClick={() => navigate('/restaurants')}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                <ShoppingBag className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-xs text-center">Restaurants</span>
            </button>
            
            <button 
              onClick={() => navigate('/pickup-drop')}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-1">
                <Truck className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-center">Pick & Drop</span>
            </button>
            
            <button 
              onClick={() => navigate('/favorites')}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-1">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-xs text-center">Favorites</span>
            </button>
            
            <button 
              onClick={() => navigate('/promos')}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                <Percent className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs text-center">Offers</span>
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <button 
              onClick={() => navigate('/orders')}
              className="text-app-primary text-sm"
            >
              View All
            </button>
          </div>
          
          {customerOrders.length > 0 ? (
            <div className="space-y-3">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mr-3">
                      <Package className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(order.orderDate), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total.toFixed(2)}</p>
                    <p className={`text-xs ${
                      order.status === 'delivered' 
                        ? 'text-green-600' 
                        : order.status === 'canceled' 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                    }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
              <p className="text-gray-500">No recent orders</p>
              <button
                onClick={() => navigate('/restaurants')}
                className="mt-2 text-app-primary font-medium"
              >
                Order Now
              </button>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Account Services</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex flex-col h-auto py-5 justify-center items-center"
              onClick={() => navigate('/addresses')}
            >
              <MapPin className="w-6 h-6 text-app-primary mb-2" />
              <span>Addresses</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto py-5 justify-center items-center"
              onClick={() => navigate('/payment-methods')}
            >
              <CreditCard className="w-6 h-6 text-app-primary mb-2" />
              <span>Payment Methods</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto py-5 justify-center items-center"
              onClick={() => navigate('/profile')}
            >
              <User className="w-6 h-6 text-app-primary mb-2" />
              <span>Profile</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col h-auto py-5 justify-center items-center"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-6 h-6 text-app-primary mb-2" />
              <span>Notifications</span>
            </Button>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Saved Addresses</h2>
            <button 
              onClick={() => navigate('/addresses')}
              className="text-app-primary text-sm"
            >
              Manage
            </button>
          </div>
          
          {user?.address && user.address.length > 0 ? (
            <div className="space-y-3">
              {user.address
                .filter(addr => addr.isDefault)
                .map((address) => (
                  <div
                    key={address.id}
                    className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{address.title}</p>
                        <p className="text-sm text-gray-600">{address.fullAddress}</p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl text-center border border-gray-100">
              <p className="text-gray-500">No addresses saved yet</p>
              <button
                onClick={() => navigate('/addresses/add')}
                className="mt-2 text-app-primary font-medium"
              >
                Add Address
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
        <button 
          onClick={() => navigate('/customer/dashboard')}
          className="flex flex-col items-center p-2 text-app-primary"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button 
          onClick={() => navigate('/orders')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <Package className="w-6 h-6" />
          <span className="text-xs mt-1">Orders</span>
        </button>
        
        <button 
          onClick={() => navigate('/favorites')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <Heart className="w-6 h-6" />
          <span className="text-xs mt-1">Favorites</span>
        </button>
        
        <button 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center p-2 text-gray-500"
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default CustomerDashboard;
