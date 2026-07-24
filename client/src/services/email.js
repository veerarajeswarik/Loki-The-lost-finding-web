import emailjs from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

export const emailConfigured = Boolean(PUBLIC_KEY && SERVICE_ID && TEMPLATE_ID);

let inited = false;
function ensureInit() {
  if (!inited && emailConfigured) {
    emailjs.init({ publicKey: PUBLIC_KEY });
    inited = true;
  }
}

/**
 * Send a templated email alert for a LOKII event. No-op when EmailJS is not
 * configured — in-app notifications remain the source of truth.
 *
 * @param {Object} params { to_email, to_name, title, message, event_type }
 */
export async function sendEmailAlert(params) {
  if (!emailConfigured) {
    console.log('[EmailJS] (skipped) email alert:', params.title);
    return false;
  }
  ensureInit();
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
    return true;
  } catch (err) {
    console.warn('[EmailJS] send failed:', err?.text || err.message);
    return false;
  }
}
