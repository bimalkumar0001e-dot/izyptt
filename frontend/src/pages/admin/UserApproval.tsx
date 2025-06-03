
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Truck, Search, Check, X, Phone, Mail, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const UserApproval: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, approveUser, rejectUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    navigate('/login');
    return null;
  }
  
  // Mock pending users
  const pendingRestaurants = [
    {
      id: 'restaurant2',
      name: 'Spice Garden',
      email: 'newrestaurant@example.com',
      phone: '9876543215',
      role: 'restaurant',
      createdAt: new Date('2024-05-02'),
      address: '456 Market Street, Patna, Bihar'
    }
  ];
  
  const pendingDelivery = [
    {
      id: 'delivery2',
      name: 'Amit Kumar',
      email: 'newdelivery@example.com',
      phone: '9876543214',
      role: 'delivery',
      createdAt: new Date('2024-05-01'),
      address: '789 Main Road, Gaya, Bihar'
    }
  ];
  
  const handleApprove = async (userId: string, userRole: 'restaurant' | 'delivery') => {
    await approveUser(userId, userRole);
  };
  
  const handleReject = async (userId: string) => {
    await rejectUser(userId);
  };
  
  const filteredRestaurants = searchQuery 
    ? pendingRestaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery)
      )
    : pendingRestaurants;
  
  const filteredDelivery = searchQuery 
    ? pendingDelivery.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.includes(searchQuery)
      )
    : pendingDelivery;
  
  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Approval Requests</h1>
        </div>
      </header>
      
      <div className="p-4 pb-16">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search by name, email, or phone"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="restaurants">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="restaurants">
              Restaurants
              {pendingRestaurants.length > 0 && (
                <span className="ml-1 bg-app-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRestaurants.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="delivery">
              Delivery Partners
              {pendingDelivery.length > 0 && (
                <span className="ml-1 bg-app-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingDelivery.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="restaurants">
            {filteredRestaurants.length > 0 ? (
              <div className="space-y-4">
                {filteredRestaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id}
                    className="bg-white p-4 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mr-3 flex-shrink-0">
                        <Store className="w-6 h-6 text-orange-500" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        </div>
                        
                        <div className="text-sm space-y-1 mt-1">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-500 mr-1" />
                            <span>{restaurant.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-500 mr-1" />
                            <span>{restaurant.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                            <span>Applied on {restaurant.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm mt-2">{restaurant.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex mt-4 space-x-2">
                      <button
                        onClick={() => handleApprove(restaurant.id, 'restaurant')}
                        className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-md flex items-center justify-center"
                      >
                        <Check size={16} className="mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(restaurant.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-md flex items-center justify-center"
                      >
                        <X size={16} className="mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending restaurant approvals</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="delivery">
            {filteredDelivery.length > 0 ? (
              <div className="space-y-4">
                {filteredDelivery.map((delivery) => (
                  <div 
                    key={delivery.id}
                    className="bg-white p-4 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-3 flex-shrink-0">
                        <Truck className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-lg">{delivery.name}</h3>
                        </div>
                        
                        <div className="text-sm space-y-1 mt-1">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-500 mr-1" />
                            <span>{delivery.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-500 mr-1" />
                            <span>{delivery.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                            <span>Applied on {delivery.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm mt-2">{delivery.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex mt-4 space-x-2">
                      <button
                        onClick={() => handleApprove(delivery.id, 'delivery')}
                        className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-md flex items-center justify-center"
                      >
                        <Check size={16} className="mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(delivery.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-md flex items-center justify-center"
                      >
                        <X size={16} className="mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-xl text-center border border-gray-100">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending delivery partner approvals</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserApproval;
