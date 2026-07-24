import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, EyeOff } from 'lucide-react';
import { apiPatch } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function Profile() {
  const { user, setProfile } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || '',
    leaderboardOptOut: user?.leaderboardOptOut || false,
  });
  const [interests, setInterests] = useState(user?.interests || []);
  const [interestInput, setInterestInput] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const addInterest = () => {
    const v = interestInput.trim();
    if (v && !interests.includes(v) && interests.length < 20) {
      setInterests([...interests, v]);
    }
    setInterestInput('');
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await apiPatch('/users/me', { ...form, interests });
      setProfile(updated);
      toast.success('Profile updated 🌿');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-medium text-ink">Profile</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card hover={false} className="p-7">
          <form onSubmit={save} className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatarUrl} name={user?.name} size="xl" />
              <div>
                <p className="font-semibold text-ink">{user?.email}</p>
                <Badge tone="primary" className="mt-1 capitalize">{user?.role}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Name" value={form.name} onChange={set('name')} />
              <Input label="Department" value={form.department} onChange={set('department')} placeholder="e.g. Computer Science" />
              <Input label="Phone (optional)" value={form.phone} onChange={set('phone')} placeholder="Shared only after verification" />
            </div>

            {/* Interests editor — powers personalized reward recommendations */}
            <div>
              <label className="label">Interests (for personalized rewards)</label>
              <div className="mb-2 flex flex-wrap gap-2">
                {interests.map((tag) => (
                  <Badge key={tag} tone="primary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setInterests(interests.filter((t) => t !== tag))}
                      className="ml-0.5 text-primary-500 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {interests.length === 0 && <span className="text-xs text-ink-soft/70">No interests yet.</span>}
              </div>
              <div className="flex gap-2">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                  placeholder="e.g. web development, data science"
                  className="flex-1"
                />
                <Button type="button" onClick={addInterest} variant="secondary" icon={Plus}>
                  Add
                </Button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={form.leaderboardOptOut}
                onChange={(e) => setForm((f) => ({ ...f, leaderboardOptOut: e.target.checked }))}
                className="h-4 w-4 rounded border-hairline text-primary-600 focus:ring-primary-300"
              />
              <EyeOff className="h-3.5 w-3.5" /> Hide me from the public leaderboard
            </label>

            <Button type="submit" loading={busy}>
              Save changes
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
