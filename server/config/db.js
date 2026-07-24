import mongoose from 'mongoose';
import { env, isConfigured } from './env.js';

let connected = false;

export function isDbConnected() {
  return connected && mongoose.connection.readyState === 1;
}

export async function connectDB() {
  if (!isConfigured('mongo')) {
    console.warn(
      '[DB] MONGO_URI not set — database features are disabled. ' +
        'Set MONGO_URI in server/.env to enable persistence.'
    );
    return false;
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    connected = true;
    console.log('[DB] MongoDB connected');
    mongoose.connection.on('disconnected', () => {
      connected = false;
      console.warn('[DB] MongoDB disconnected');
    });
    return true;
  } catch (err) {
    connected = false;
    console.error('[DB] MongoDB connection failed:', err.message);
    return false;
  }
}
