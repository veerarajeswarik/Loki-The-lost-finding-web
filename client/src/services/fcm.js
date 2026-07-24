import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, firebaseConfigured } from './firebase.js';
import { apiPost } from './api.js';

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Request notification permission, obtain an FCM token, and register it with
 * the backend. No-op when Firebase / VAPID is not configured.
 */
export async function initPushNotifications() {
  if (!firebaseConfigured || !vapidKey || !app) return null;
  if (typeof Notification === 'undefined') return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey });
    if (token) {
      await apiPost('/notifications/token', { token });
    }

    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      if (title) {
        // Surface foreground pushes as a native notification.
        new Notification(title, { body });
      }
    });

    return token;
  } catch (err) {
    console.warn('[FCM] init failed:', err.message);
    return null;
  }
}
