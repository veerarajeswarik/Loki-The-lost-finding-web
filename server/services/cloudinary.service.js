import { v2 as cloudinary } from 'cloudinary';
import { env, isConfigured } from '../config/env.js';

let configured = false;

function ensureConfig() {
  if (configured) return;
  if (isConfigured('cloudinary')) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
}

/**
 * Produce a signature for a direct (client-side) signed upload. When
 * Cloudinary is not configured, returns { fallback: true } so the client
 * uses a placeholder / provided URL instead.
 */
export function getUploadSignature() {
  if (!isConfigured('cloudinary')) {
    return { fallback: true };
  }
  ensureConfig();
  // timestamp seconds (Date.now avoided at module scope; fine inside handler)
  const timestamp = Math.round(Date.now() / 1000);
  const folder = env.cloudinary.folder;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.cloudinary.apiSecret
  );
  return {
    fallback: false,
    timestamp,
    signature,
    folder,
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName,
  };
}

/**
 * Upload a base64 data URI or remote URL from the server side.
 * Falls back to returning the source (or a placeholder) unchanged.
 */
export async function uploadImage(source) {
  if (!isConfigured('cloudinary')) {
    return {
      url: source || placeholder(),
      publicId: '',
      fallback: true,
    };
  }
  ensureConfig();
  try {
    const res = await cloudinary.uploader.upload(source, {
      folder: env.cloudinary.folder,
    });
    return { url: res.secure_url, publicId: res.public_id, fallback: false };
  } catch (err) {
    console.error('[Cloudinary] upload failed:', err.message);
    return { url: source || placeholder(), publicId: '', fallback: true };
  }
}

export async function deleteImage(publicId) {
  if (!publicId || !isConfigured('cloudinary')) return;
  ensureConfig();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('[Cloudinary] delete failed:', err.message);
  }
}

function placeholder() {
  return 'https://placehold.co/600x400/16a34a/ffffff?text=LOKII';
}
