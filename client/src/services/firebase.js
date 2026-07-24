import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase is "configured" only when the essential keys are present.
export const firebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let app = null;
let auth = null;

if (firebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { app, auth };

// ── Real Firebase auth helpers ───────────────────────────────
export async function firebaseEmailLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function firebaseEmailRegister(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  return cred;
}

export async function firebaseGoogleLogin() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function firebaseSignOut() {
  if (auth) return fbSignOut(auth);
  return null;
}

export function watchAuth(cb) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, cb);
}
