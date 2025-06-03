import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import { RestaurantBottomNav } from '@/components/restaurant/RestaurantBottomNav';
import { BACKEND_URL } from '@/utils/utils';

interface Notification {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const API_BASE = `${BACKEND_URL}/api`;

const RestaurantNotification: React.FC = () => {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Move authentication check to useEffect to prevent premature redirects
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
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Use token from state or localStorage
        const storedToken = localStorage.getItem('token') || token;
        
        if (!storedToken) {
          console.error('No token available for notifications fetch');
          setNotifications([]);
          setLoading(false);
          return;
        }
        
        const res = await fetch(`${API_BASE}/restaurants/notifications`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        } else {
          console.error('Error fetching notifications:', res.status);
          setNotifications([]);
        }
      } catch (err) {
        console.error('Exception fetching notifications:', err);
        setNotifications([]);
      }
      setLoading(false);
    };
    
    // Only fetch if we have authentication data (either from context or localStorage)
    const storedToken = localStorage.getItem('token') || token;
    const storedUser = localStorage.getItem('user');
    let userRole = '';
    
    try {
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userRole = userData.role;
      }
    } catch (err) {
      console.error('Error parsing stored user:', err);
    }
    
    // Fetch notifications if we have a token and either context user is restaurant or localStorage user is restaurant
    if (storedToken && (user?.role === 'restaurant' || userRole === 'restaurant')) {
      fetchNotifications();
    }
  }, [token, isAuthenticated, user]);

  // Show loading state during authentication check
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

  return (
    <div className="app-container">
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/restaurant/dashboard')} 
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Restaurant Notifications</h1>
        </div>
        <div>
          <button
            onClick={() => navigate('/restaurant/notifications')}
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

      <div className="p-4 pb-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold mb-4">Your Notifications</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No notifications found.</div>
          ) : (
            <ul className="space-y-4">
              {notifications.map(n => (
                <li
                  key={n._id}
                  className={`p-3 rounded-lg border ${n.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'} shadow-sm`}
                  style={{ fontWeight: n.read ? 'normal' : 'bold' }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-600 mb-1 capitalize">{n.type} notification</div>
                      <div className="font-medium">{n.message}</div>
                    </div>
                    <div className="text-xs text-gray-400 ml-3 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <RestaurantBottomNav />
    </div>
  );
};

export default RestaurantNotification;
