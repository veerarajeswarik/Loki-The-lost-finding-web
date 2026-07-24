import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiGet, apiPatch } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const timer = useRef(null);

  const load = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      const data = await apiGet('/notifications');
      setItems(data.items || []);
      setUnread(data.unread || 0);
    } catch {
      /* ignore polling errors */
    }
  }, [isAuthenticated, user]);

  // Poll every 20s while authenticated.
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setItems([]);
      setUnread(0);
      return undefined;
    }
    load();
    timer.current = setInterval(load, 20000);
    return () => clearInterval(timer.current);
  }, [isAuthenticated, user, load]);

  const markRead = useCallback(async (id) => {
    try {
      await apiPatch(`/notifications/${id}/read`);
      setItems((list) => list.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await apiPatch('/notifications/read-all');
      setItems((list) => list.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  }, []);

  const value = { items, unread, load, markRead, markAllRead };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
