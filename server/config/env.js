import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const bool = (v) => Boolean(v && String(v).trim().length > 0);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  mongoUri: process.env.MONGO_URI || '',

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },

  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '',
    serviceAccountPath:
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'lokii',
  },

  matchThreshold: Number(process.env.MATCH_CONFIDENCE_THRESHOLD) || 60,
  verificationThreshold: Number(process.env.VERIFICATION_PASS_THRESHOLD) || 70,
};

/**
 * Central feature-flag helper. Every external service checks this so the
 * app degrades gracefully (dev/mock behaviour) instead of crashing when a
 * credential is missing.
 */
export function isConfigured(service) {
  switch (service) {
    case 'mongo':
      return bool(env.mongoUri);
    case 'gemini':
      return bool(env.gemini.apiKey);
    case 'firebase':
      return bool(env.firebase.serviceAccount) || hasServiceAccountFile();
    case 'cloudinary':
      return (
        bool(env.cloudinary.cloudName) &&
        bool(env.cloudinary.apiKey) &&
        bool(env.cloudinary.apiSecret)
      );
    default:
      return false;
  }
}

function hasServiceAccountFile() {
  try {
    return fs.existsSync(env.firebase.serviceAccountPath);
  } catch {
    return false;
  }
}

export function logConfigSummary(logger = console) {
  const status = (ok) => (ok ? 'configured' : 'FALLBACK (dev/mock)');
  logger.log('┌── LOKII service configuration ───────────────');
  logger.log(`│ MongoDB     : ${status(isConfigured('mongo'))}`);
  logger.log(`│ Firebase    : ${status(isConfigured('firebase'))}`);
  logger.log(`│ Gemini AI   : ${status(isConfigured('gemini'))}`);
  logger.log(`│ Cloudinary  : ${status(isConfigured('cloudinary'))}`);
  logger.log('└──────────────────────────────────────────────');
  if (!isConfigured('firebase')) {
    logger.warn(
      '[SECURITY] Firebase Admin not configured — running in DEV AUTH MODE. ' +
        'Requests are trusted via x-dev-uid headers. DO NOT use in production.'
    );
  }
}
