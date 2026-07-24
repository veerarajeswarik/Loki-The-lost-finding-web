/* eslint-disable */
/**
 * Firebase Cloud Messaging service worker for background web push.
 *
 * FCM requires this file to be served at the site root (/firebase-messaging-sw.js).
 * Fill in your Firebase web config below (same values as client/.env). If you
 * leave LOKII in dev/fallback mode (no Firebase), background push is simply
 * inactive and in-app notifications continue to work.
 */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// TODO: replace with your Firebase web config to enable background push.
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  messagingSenderId: '',
  appId: '',
};

try {
  if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const { title, body } = payload.notification || {};
      if (title) {
        self.registration.showNotification(title, { body, icon: '/vite.svg' });
      }
    });
  }
} catch (e) {
  // Safe no-op when Firebase is not configured.
}
