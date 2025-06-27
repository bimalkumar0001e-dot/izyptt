import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ShoppingBag, Phone, Mail, MapPin, Settings, Edit, Heart, CreditCard, Percent, Bell, Truck, MessageCircle } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/types/user';
import { toast } from '@/components/ui/use-toast';
import WallpaperCard from '@/components/wallpaperCard';
import { BACKEND_URL } from '@/utils/utils';

const roleDashboardMap: Record<UserRole, string> = {
  'admin': '/admin/dashboard',
  'restaurant': '/restaurant/dashboard',
  'delivery': '/delivery/dashboard',
  'customer': '/orders'
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  
  // Redirect to login if not authenticated (but only after loading)
  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      navigate('/login');
    }
  }, [isAuthenticated, user, isLoading, navigate]);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out"
    });
    navigate('/');
  };
  
  // Fetch wallpaper from backend
  const [wallpaper, setWallpaper] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`${BACKEND_URL}/api/admin/profile-wallpapers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].image) {
          const img = data[0].image.startsWith('http')
            ? data[0].image
            : `${BACKEND_URL}${data[0].image}`;
          setWallpaper(img);
        } else {
          setWallpaper(null);
        }
      })
      .catch(() => setWallpaper(null));
  }, []);
  
  if (isLoading) {
    // Optionally show a spinner or nothing while loading
    return null;
  }
  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <div className="app-container">
      <AppHeader title="Profile" />
      <div className="flex-1 pb-16">
        {/* Wallpaper background section */}
        <div className="relative w-full flex flex-col items-center" style={{ minHeight: 220 }}>
          {/* WallpaperCard as background, only if wallpaper exists */}
          {wallpaper && (
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              <WallpaperCard image={wallpaper} className="w-full h-full" />
              {/* Removed overlay for original quality */}
            </div>
          )}
          {/* Profile content above wallpaper */}
          <div className="relative z-10 p-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-500" />
              )}
            </div>
            {/* Name and role in a box */}
            <div className="flex flex-col items-center border border-gray-200 rounded-xl px-6 py-3 mb-3 bg-white shadow-sm">
              <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-0"
              onClick={() => navigate('/profile/edit')}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          </div>
        </div>
        
        <div className="p-4">
          <div
            className="app-card mb-4 rounded-2xl shadow-sm border border-gray-100"
            style={{
              background: "linear-gradient(135deg, #f8fafc 60%, #e0e7ff 100%)",
              // You can adjust the gradient colors for your brand
            }}
          >
            <h2 className="font-medium mb-3">Personal Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm text-gray-700 font-semibold">Phone</h3>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm text-gray-700 font-semibold">Email</h3>
                  <p className={user.email && user.email.trim() !== '' ? "text-gray-900" : "text-gray-400 font-semibold"}>
                    {user.email && user.email.trim() !== ''
                      ? user.email
                      : <span>Not set</span>
                    }
                  </p>
                </div>
              </div>
              {user.address && user.address.length > 0 && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm text-gray-700 font-semibold">Default Address</h3>
                    <p className="text-gray-900">{user.address[0].fullAddress}</p>
                    <p className="text-sm text-gray-700">{user.address[0].city}, {user.address[0].pincode}</p>
                  </div>
                </div>
              )}
            </div>
            {user.role === 'customer' && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 border-gray-200 bg-white/70 hover:bg-white"
                  onClick={() => navigate('/addresses')}
                >
                  <MapPin className="w-4 h-4 mr-2 text-app-primary" />
                  <span className="font-semibold text-gray-900">Manage Addresses</span>
                </Button>
              </div>
            )}
          </div>
          
          <div
            className="app-card mb-4 rounded-2xl shadow-sm border border-gray-100"
            style={{
              background: "linear-gradient(135deg, #fff7f0 60%, #ffe6e6 100%)",
              // You can adjust the gradient colors for your brand
            }}
          >
            <h2 className="font-medium mb-2">Actions</h2>
            <div className="space-y-2">
              {user.role !== 'customer' && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                  onClick={() => navigate(roleDashboardMap[user.role])}
                >
                  <ShoppingBag className="w-5 h-5 mr-3 text-app-primary" />
                  {user.role === 'admin' 
                    ? 'Admin Dashboard' 
                    : user.role === 'restaurant' 
                      ? 'Restaurant Dashboard' 
                      : 'Delivery Dashboard'}
                </Button>
              )}
              
              {user.role === 'customer' && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                    onClick={() => navigate('/orders')}
                  >
                    <ShoppingBag className="w-5 h-5 mr-3 text-app-primary" />
                    My Orders
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                    onClick={() => navigate('/my-pickups')}
                  >
                    <Truck className="w-5 h-5 mr-3 text-app-primary" />
                    My Pickups
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                    onClick={() => navigate('/promos')}
                  >
                    <Percent className="w-5 h-5 mr-3 text-app-primary" />
                    Promo Codes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                    onClick={() => navigate('/notifications')}
                  >
                    <Bell className="w-5 h-5 mr-3 text-app-primary" />
                    Notifications
                  </Button>
                  {/* Only show Return Instructions for customers */}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                    onClick={() => navigate('/return-instructions')}
                  >
                    <Percent className="w-5 h-5 mr-3 text-app-primary" />
                    Return Instructions
                  </Button>
                  {/* Contact Us button */}
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                    onClick={() => navigate('/contact-us')}
                  >
                    <MessageCircle className="w-5 h-5 mr-3 text-app-primary" />
                    Contact Us
                  </Button>
                </>
              )}
              
             {/* Change Password - Only show for non-customer roles */}
            {user.role !== 'customer' && (
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-3 border-gray-200 bg-white/70 hover:bg-white"
                onClick={() => navigate('/change-password')}
              >
                <Settings className="w-5 h-5 mr-3 text-app-primary" />
                Change Password
              </Button>
            )}

            <Separator className="my-2" />

            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3 border-gray-200 text-app-error"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
