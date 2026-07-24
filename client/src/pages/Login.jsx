import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Chrome, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';

export default function Login() {
  const { loginEmail, loginGoogle, devMode } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await loginEmail(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      await loginGoogle();
      toast.success('Signed in with Google');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-0">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card hover={false} className="p-8">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-2xl">
              🌿
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink">Welcome back to LOKII</h1>
            <p className="mt-1 text-sm text-ink-soft">Sign in to report and recover items</p>
          </div>

          {devMode && (
            <div className="mb-5 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
              <Info className="h-4 w-4 shrink-0" />
              <span>
                Dev mode: enter any email (e.g. <b>alice@lokii.dev</b>) and any password to sign in.
                Use <b>admin@lokii.dev</b> for the admin dashboard.
              </span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
            />
            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button type="submit" loading={busy} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-soft/60">
            <div className="h-px flex-1 bg-hairline" /> or <div className="h-px flex-1 bg-hairline" />
          </div>

          <Button onClick={google} disabled={busy} variant="outline" icon={Chrome} className="w-full">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-ink-soft">
            New here?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:underline">
              Create an account
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
