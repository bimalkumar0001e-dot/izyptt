import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Phone, MapPin, LogOut, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/components/ui/sonner';
import { RestaurantBottomNav } from '@/components/restaurant/RestaurantBottomNav';
import { BACKEND_URL } from '@/utils/utils';

const API_BASE = `${BACKEND_URL}/api`;

const RestaurantProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateProfile, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    // Only redirect if auth is finished loading AND we're definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
    // Only redirect if we know the user is not a restaurant
    else if (!isLoading && user && user.role !== 'restaurant') {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    // Update form when user data changes
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  useEffect(() => {
    // Only fetch if authenticated
    if (!isAuthenticated || !user) return;
    
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/restaurants/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, user]);

  // Wait for auth to finish loading before rendering
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Only show placeholder while checking auth
  if (!isAuthenticated) {
    // Attempt to use localStorage directly as a fallback
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'restaurant') {
          // Continue rendering if localStorage indicates user is a restaurant
          // The auth context will catch up shortly
        } else {
          return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
        }
      } catch {
        return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
      }
    } else {
      return <div className="flex justify-center items-center h-screen">Checking authentication...</div>;
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

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
        description: "Your restaurant profile has been updated.",
      });
      setEditDialogOpen(false);
    } catch (error) {
      toast("Update failed", {
        description: "There was an error updating your profile.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const restaurantStats = {
    totalOrders: orders.length,
    avgRating: 4.6,
    deliveryTime: "30 mins",
    menuItems: 85,
  };

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center">
          <button onClick={() => navigate('/restaurant/dashboard')} className="mr-2 p-1 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Restaurant Profile</h1>
        </div>
        <button onClick={() => navigate('/restaurant/notifications')} className="relative p-2">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-app-primary text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <div className="p-4 pb-20">
        <div className="flex flex-col items-center p-4 bg-white rounded-lg border shadow-sm">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar || ''} alt={user?.name || 'Restaurant'} />
            <AvatarFallback className="text-2xl">
              {user?.name?.charAt(0) || 'R'}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-3 text-xl font-semibold">{user?.name}</h2>
          <p className="text-gray-600">Restaurant</p>
          <Badge variant="outline" className="mt-1">ID: RS{user?.id?.substring(0, 5) || '00000'}</Badge>
          <Button variant="outline" className="mt-3" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit Profile
          </Button>
        </div>

        <div className="mt-6 rounded-lg border shadow-sm bg-[#f3f6fd]">
          <div className="p-4 bg-gray-50 border-b">
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
                <p className="font-medium">123 Market Street, Delhi, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg border shadow-sm">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-medium">Restaurant Stats</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-pink-50 rounded-lg">
              <h4 className="text-sm text-gray-600">Total Orders</h4>
              <p className="text-xl font-semibold text-pink-700">
                {ordersLoading ? '...' : restaurantStats.totalOrders}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm text-gray-600">Rating</h4>
              <p className="text-xl font-semibold text-green-700">{restaurantStats.avgRating}/5</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm text-gray-600">Delivery Time</h4>
              <p className="text-xl font-semibold text-blue-700">{restaurantStats.deliveryTime}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="text-sm text-gray-600">Menu Items</h4>
              <p className="text-xl font-semibold text-yellow-700">{restaurantStats.menuItems}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button variant="destructive" className="w-full" onClick={() => setLogoutDialogOpen(true)}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <RestaurantBottomNav />

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Restaurant Profile</DialogTitle>
            <DialogDescription>
              Make changes to your restaurant account here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={editForm.name} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={editForm.email} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" value={editForm.phone} onChange={handleInputChange} required />
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription>Are you sure you want to logout?</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantProfile;
