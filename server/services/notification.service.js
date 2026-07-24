import { Notification } from '../models/Notification.js';
import { sendPush } from './fcm.service.js';

/**
 * Central notification dispatcher. Always persists an in-app Notification,
 * then best-effort fans out to FCM push. (Email is sent client-side via
 * EmailJS — the client listens for unread notifications and dispatches.)
 *
 * @param {Object} user  Mongoose User doc (must include fcmTokens)
 * @param {Object} opts  { type, title, body, data }
 */
export async function notify(user, { type, title, body = '', data = {} }) {
  if (!user?._id) return null;
  let notification = null;
  try {
    notification = await Notification.create({
      user: user._id,
      type,
      title,
      body,
      data,
    });
  } catch (err) {
    console.error('[Notify] failed to persist notification:', err.message);
  }

  // Best-effort push — never throws.
  try {
    await sendPush(user, { title, body, data: { type, ...data } });
  } catch (err) {
    console.error('[Notify] push failed:', err.message);
  }

  return notification;
}
