import fs from 'fs';
import admin from 'firebase-admin';
import { env, isConfigured } from './env.js';

let app = null;

function loadServiceAccount() {
  // 1) Inline JSON string in env
  if (env.firebase.serviceAccount) {
    try {
      return JSON.parse(env.firebase.serviceAccount);
    } catch (err) {
      console.error(
        '[Firebase] FIREBASE_SERVICE_ACCOUNT is not valid JSON:',
        err.message
      );
    }
  }
  // 2) File on disk
  try {
    if (fs.existsSync(env.firebase.serviceAccountPath)) {
      return JSON.parse(fs.readFileSync(env.firebase.serviceAccountPath, 'utf-8'));
    }
  } catch (err) {
    console.error('[Firebase] Could not read service account file:', err.message);
  }
  return null;
}

export function initFirebaseAdmin() {
  if (app) return app;
  if (!isConfigured('firebase')) return null;

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) return null;

  try {
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Firebase] Admin SDK initialized');
    return app;
  } catch (err) {
    console.error('[Firebase] Admin init failed:', err.message);
    return null;
  }
}

/**
 * Verify a Firebase ID token. Returns the decoded token or throws.
 */
export async function verifyIdToken(idToken) {
  if (!app) initFirebaseAdmin();
  if (!app) throw new Error('Firebase Admin not initialized');
  return admin.auth().verifyIdToken(idToken);
}

/**
 * Send a push message via FCM to a set of tokens. No-op (returns null) when
 * Firebase Admin is not configured.
 */
export async function sendFcmMulticast({ tokens, title, body, data }) {
  if (!app) initFirebaseAdmin();
  if (!app || !tokens || tokens.length === 0) return null;
  try {
    return await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data || {}).map(([k, v]) => [k, String(v)])
      ),
    });
  } catch (err) {
    console.error('[Firebase] FCM send failed:', err.message);
    return null;
  }
}

export { admin };
