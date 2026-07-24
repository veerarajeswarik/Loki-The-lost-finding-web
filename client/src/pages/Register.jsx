import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Chrome, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';
import { ROLES } from '../utils/constants.js';

export default function Register() {
  const { registerEmail, loginGoogle, devMode } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      await registerEmail(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome to LOKII 🌿');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      await loginGoogle();
      navigate('/dashboard', { replace: true });
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
            <h1 className="font-display text-2xl font-semibold text-ink">Join LOKII</h1>
            <p className="mt-1 text-sm text-ink-soft">Create your campus account</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input label="Full name" required icon={User} value={form.name} onChange={set('name')} placeholder="Alex Doe" />
            <Input label="Email" type="email" required icon={Mail} value={form.email} onChange={set('email')} placeholder="you@campus.edu" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Password" type="password" required icon={Lock} value={form.password} onChange={set('password')} placeholder="••••••••" />
              <Select label="Role" value={form.role} onChange={set('role')}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>

            {devMode && (
              <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
                <Info className="h-4 w-4 shrink-0" />
                <span>
                  Dev mode: choose <b>admin</b> or <b>security</b> to preview the admin dashboard.
                </span>
              </div>
            )}

            <Button type="submit" loading={busy} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-soft/60">
            <div className="h-px flex-1 bg-hairline" /> or <div className="h-px flex-1 bg-hairline" />
          </div>
          <Button onClick={google} disabled={busy} variant="outline" icon={Chrome} className="w-full">
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
