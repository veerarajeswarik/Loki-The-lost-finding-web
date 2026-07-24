import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  firebaseConfigured,
  auth,
  watchAuth,
  firebaseEmailLogin,
  firebaseEmailRegister,
  firebaseGoogleLogin,
  firebaseSignOut,
} from '../services/firebase.js';
import { api, setAuthHeaderProvider, apiGet, apiPost } from '../services/api.js';

export const AuthContext = createContext(null);

const DEV_KEY = 'lokii_dev_identity';

/**
 * AuthContext supports two modes:
 *  - Real Firebase (when VITE_FIREBASE_* is set): Bearer ID tokens.
 *  - Dev mode (no Firebase config): a mock identity stored in localStorage,
 *    sent to the backend as x-dev-* headers.
 */
export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // Mongo user
  const [loading, setLoading] = useState(true);

  // Dev identity kept in a ref so the header provider always sees latest.
  const devIdentityRef = useRef(readDevIdentity());
  const [devIdentity, setDevIdentity] = useState(devIdentityRef.current);

  // Register the header provider used by the axios interceptor.
  useEffect(() => {
    setAuthHeaderProvider(async () => {
      if (firebaseConfigured) {
        const u = auth?.currentUser;
        if (!u) return {};
        const token = await u.getIdToken();
        return { Authorization: `Bearer ${token}` };
      }
      const id = devIdentityRef.current;
      if (!id) return {};
      return {
        'x-dev-uid': id.uid,
        'x-dev-email': id.email,
        'x-dev-name': id.name,
        ...(id.role ? { 'x-dev-role': id.role } : {}),
      };
    });
  }, []);

  const syncProfile = useCallback(async (extra = {}) => {
    const user = await apiPost('/auth/sync', extra);
    setProfile(user);
    return user;
  }, []);

  // ── Real Firebase: react to auth state ──────────────────────
  useEffect(() => {
    if (!firebaseConfigured) {
      // Dev mode: if a dev identity exists, sync it.
      const id = devIdentityRef.current;
      if (id) {
        syncProfile({ name: id.name, email: id.email })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
      return undefined;
    }

    const unsub = watchAuth(async (u) => {
      setFirebaseUser(u);
      if (u) {
        try {
          await syncProfile({ name: u.displayName, email: u.email, avatarUrl: u.photoURL });
        } catch (err) {
          console.error('Profile sync failed:', err.message);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [syncProfile]);

  // ── Actions ─────────────────────────────────────────────────
  const loginEmail = useCallback(
    async (email, password) => {
      if (firebaseConfigured) {
        await firebaseEmailLogin(email, password);
        return;
      }
      // Dev mode: treat email as identity.
      const id = makeDevIdentity({ email, name: email.split('@')[0] });
      persistDev(id);
      devIdentityRef.current = id;
      setDevIdentity(id);
      await syncProfile({ name: id.name, email: id.email });
    },
    [syncProfile]
  );

  const registerEmail = useCallback(
    async (name, email, password, role) => {
      if (firebaseConfigured) {
        await firebaseEmailRegister(email, password, name);
        return;
      }
      const id = makeDevIdentity({ email, name, role });
      persistDev(id);
      devIdentityRef.current = id;
      setDevIdentity(id);
      await syncProfile({ name, email });
    },
    [syncProfile]
  );

  const loginGoogle = useCallback(async () => {
    if (firebaseConfigured) {
      await firebaseGoogleLogin();
      return;
    }
    // Dev mode Google mock.
    const id = makeDevIdentity({
      email: 'google.user@dev.lokii',
      name: 'Google Dev User',
    });
    persistDev(id);
    devIdentityRef.current = id;
    setDevIdentity(id);
    await syncProfile({ name: id.name, email: id.email });
  }, [syncProfile]);

  const logout = useCallback(async () => {
    if (firebaseConfigured) {
      await firebaseSignOut();
    } else {
      localStorage.removeItem(DEV_KEY);
      devIdentityRef.current = null;
      setDevIdentity(null);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const me = await apiGet('/auth/me');
      setProfile(me);
      return me;
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = firebaseConfigured ? Boolean(firebaseUser) : Boolean(devIdentity);

  const value = useMemo(
    () => ({
      loading,
      firebaseConfigured,
      devMode: !firebaseConfigured,
      isAuthenticated,
      user: profile,
      setProfile,
      loginEmail,
      registerEmail,
      loginGoogle,
      logout,
      refreshProfile,
      syncProfile,
      api,
    }),
    [loading, isAuthenticated, profile, loginEmail, registerEmail, loginGoogle, logout, refreshProfile, syncProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Dev identity helpers ──────────────────────────────────────
function readDevIdentity() {
  try {
    const raw = localStorage.getItem(DEV_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistDev(id) {
  localStorage.setItem(DEV_KEY, JSON.stringify(id));
}

function makeDevIdentity({ email, name, role }) {
  const slug = (email || 'user').split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
  return {
    uid: `dev-${slug || 'user'}`,
    email: email || `${slug}@dev.lokii`,
    name: name || 'Dev User',
    role,
  };
}
