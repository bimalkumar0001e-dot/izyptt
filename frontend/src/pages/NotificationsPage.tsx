import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Check, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type and user role
    if (notification.type === 'order' && notification.orderId) {
      navigate(`/order/${notification.orderId}`);
    } else if (notification.type === 'delivery' && notification.orderId) {
      navigate(`/delivery/orders/${notification.orderId}`);
    }
  };

  return (
    <div className="app-container">
      <AppHeader title="Notifications" showBackButton />
      
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Your Notifications</h1>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
            
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearNotifications}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-100'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full ${
                    notification.type === 'order' ? 'bg-green-100' : 
                    notification.type === 'status' ? 'bg-blue-100' :
                    notification.type === 'delivery' ? 'bg-yellow-100' :
                    notification.type === 'system' ? 'bg-purple-100' : 'bg-gray-100'
                  } mr-3`}>
                    <Bell className={`h-5 w-5 ${
                      notification.type === 'order' ? 'text-green-600' : 
                      notification.type === 'status' ? 'text-blue-600' :
                      notification.type === 'delivery' ? 'text-yellow-600' :
                      notification.type === 'system' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600 text-sm">{notification.message}</p>
                    
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">You don't have any notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
