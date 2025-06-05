import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BACKEND_URL } from '@/utils/utils';

interface Notification {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const AdminNotification: React.FC = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchNotifications();
  }, [token]);

  return (
    <div>
      <h2>Admin Notifications</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {notifications.length === 0 && <li>No notifications found.</li>}
          {notifications.map(n => (
            <li key={n._id} style={{ fontWeight: n.read ? 'normal' : 'bold' }}>
              <strong>{n.type}:</strong> {n.message}
              <span> ({new Date(n.createdAt).toLocaleString()})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminNotification;