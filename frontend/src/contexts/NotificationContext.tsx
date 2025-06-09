import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const prevNotificationIds = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Fetch notifications from backend for admin/restaurant
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
          const newNotifications = data.map((n: any) => ({
            id: n._id,
            title: n.type === 'system' ? 'System Notification' : n.type === 'order' ? 'Order Notification' : 'Notification',
            message: n.message,
            timestamp: new Date(n.createdAt),
            type: n.type,
            isRead: n.read,
          }));

          // Detect new notifications
          const newIds = new Set(newNotifications.map(n => n.id));
          const prevIds = prevNotificationIds.current;
          const isFirstLoad = prevIds.size === 0;
          const hasNew = !isFirstLoad && newNotifications.some(n => !prevIds.has(n.id));
          setNotifications(newNotifications);
          prevNotificationIds.current = newIds;
          // Play sound if new notification(s) arrived (not on first load)
          if (hasNew && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    } else {
      setNotifications([]);
      prevNotificationIds.current = new Set();
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
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

  // One-time user interaction to enable sound
  const handleEnableSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    setSoundEnabled(true);
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
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      {!soundEnabled && (
        <button
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: '12px 20px',
            background: '#2563eb',
            color: 'white',
            borderRadius: 8,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
          onClick={handleEnableSound}
        >
          Enable Notification Sound
        </button>
      )}
      {children}
    </NotificationContext.Provider>
  );
};