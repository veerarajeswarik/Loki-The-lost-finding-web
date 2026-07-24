import { sendFcmMulticast } from '../config/firebaseAdmin.js';
import { isConfigured } from '../config/env.js';

/**
 * Send a push notification to a user's registered FCM tokens.
 * No-op (logged) when Firebase Admin is not configured.
 */
export async function sendPush(user, { title, body, data }) {
  const tokens = (user?.fcmTokens || []).filter(Boolean);
  if (!isConfigured('firebase') || tokens.length === 0) {
    console.log(
      `[FCM] (skipped) push to ${user?.email || 'user'} — "${title}"`
    );
    return null;
  }
  return sendFcmMulticast({ tokens, title, body, data });
}
