import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '@/types/notification';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { BACKEND_URL } from '@/utils/utils';

interface NotificationContextProps {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user, token } = useAuth(); // Make sure your AuthContext provides token
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from backend for admin
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && token) {
        let url = '';
        if (user.role === 'admin') {
          url = `${BACKEND_URL}/api/admin/notifications`;
        } else if (user.role === 'restaurant') {
          url = `${BACKEND_URL}/api/restaurants/notifications`;
        } else {
          setNotifications([]);
          return;
        }
        try {
          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setNotifications(
              data.map((n: any) => ({
                id: n._id,
                title: n.type === 'system' ? 'System Notification' : n.type === 'order' ? 'Order Notification' : 'Notification',
                message: n.message,
                timestamp: new Date(n.createdAt),
                type: n.type,
                isRead: n.read,
              }))
            );
          }
        } catch (err) {
          console.error('Failed to fetch notifications', err);
        }
      } else {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [user, token]);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);

    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};