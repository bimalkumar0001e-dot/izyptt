import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, User, Mail, Phone, MapPin, LogOut, Edit, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/components/ui/sonner';
import { DeliveryBottomNav } from '@/components/delivery/DeliveryBottomNav';

const DeliveryProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { unreadCount } = useNotifications();
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  
  // Edit profile form state
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Redirect if not authenticated or not delivery partner
  if (!isAuthenticated || user?.role !== 'delivery') {
    navigate('/login');
    return null;
  }
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        ...user,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      });
      
      toast("Profile updated", {
        description: "Your profile information has been updated successfully."
      });
      
      setEditProfileDialogOpen(false);
    } catch (error) {
      toast("Update failed", {
        description: "Failed to update profile. Please try again."
      });
    }
  };
  
  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };
  
  // Delivery stats data
  const [deliveredOrdersCount, setDeliveredOrdersCount] = useState<number>(0);

  useEffect(() => {
    const fetchDeliveredOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/delivery/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const orders = await res.json();
          // Count orders with status 'delivered' (case-insensitive)
          const count = (orders || []).filter(
            (o: any) => (o.status || '').toLowerCase() === 'delivered'
          ).length;
          setDeliveredOrdersCount(count);
        } else {
          setDeliveredOrdersCount(0);
        }
      } catch {
        setDeliveredOrdersCount(0);
      }
    };
    fetchDeliveredOrders();
  }, []);

  const deliveryStats = {
    totalDeliveries: deliveredOrdersCount,
    totalDistance: 1250,
    avgRating: 4.8,
    onTimeRate: 98
  };
  
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
          <h1 className="text-lg font-semibold">Delivery Partner Profile</h1>
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
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar || ''} alt={user?.name || 'Delivery Partner'} />
            <AvatarFallback className="text-2xl">
              {user?.name?.charAt(0) || 'D'}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="mt-3 text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-600">Delivery Partner</p>
          
          <Badge variant="outline" className="mt-1">ID: DP{user?.id?.substring(0, 5) || '00000'}</Badge>
          
          <Button 
            variant="outline" 
            className="mt-3"
            onClick={() => setEditProfileDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        </div>
        
        <div className="mt-6 rounded-lg border border-gray-100 shadow-sm overflow-hidden bg-[#f3f6fd]">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-medium">Contact Information</h3>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{user?.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">456 Park Avenue, Delhi, India</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-medium">Delivery Stats</h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm text-gray-600">Total Deliveries</h4>
                <p className="text-xl font-semibold text-blue-700">{deliveryStats.totalDeliveries}</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="text-sm text-gray-600">Rating</h4>
                <p className="text-xl font-semibold text-green-700">{deliveryStats.avgRating}/5</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="text-sm text-gray-600">Total Distance</h4>
                <p className="text-xl font-semibold text-purple-700">{deliveryStats.totalDistance} km</p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="text-sm text-gray-600">On-Time Rate</h4>
                <p className="text-xl font-semibold text-yellow-700">{deliveryStats.onTimeRate}%</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      <DeliveryBottomNav />
      
      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your delivery partner profile information.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                name="phone"
                value={editForm.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout from your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogoutConfirm}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryProfile;
