import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  subscribeUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeUserNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  const markRead = useCallback(async (id) => {
    await markNotificationAsRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    if (user?.uid) {
      await markAllNotificationsAsRead(user.uid);
    }
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead
  };
};

export default useNotifications;
