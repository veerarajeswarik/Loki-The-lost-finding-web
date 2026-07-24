import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Target, FileText, BookOpen, Briefcase, Link2, Gift, Award, Medal, Trophy } from 'lucide-react';
import { apiGet, apiPatch } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import { GridSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Card from '../components/ui/Card.jsx';
import { ProgressRing } from '../components/ui/Progress.jsx';
import { formatDate } from '../utils/format.js';

const RESOURCE_ICON = {
  roadmap: Map,
  'interview-prep': Target,
  cheatsheet: FileText,
  docs: BookOpen,
  career: Briefcase,
};

const BADGES = [
  { key: 'first', label: 'First Return', icon: Medal, need: 1 },
  { key: 'five', label: '5 Returns', icon: Award, need: 5 },
  { key: 'hero', label: 'Community Hero', icon: Trophy, need: 10 },
];

export default function Rewards() {
  const { user } = useAuth();
  const toast = useToast();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiGet('/rewards/mine')
      .then(setRewards)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const ack = async (rid) => {
    try {
      await apiPatch(`/rewards/${rid}/ack`);
      setRewards((r) => r.map((x) => (x._id === rid ? { ...x, acknowledged: true } : x)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const returned = user?.stats?.itemsReturned || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-medium text-ink">Knowledge Rewards</h1>
        <p className="text-sm text-ink-soft">
          Personalized educational resources earned by returning items honestly.
        </p>
      </div>

      {/* Trust + badges */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card hover={false} className="flex items-center justify-center gap-4">
          <ProgressRing value={user?.stats?.trustScore ?? 0} max={100} size={72}>
            <span className="font-display text-lg font-semibold text-ink">{user?.stats?.trustScore ?? '—'}</span>
          </ProgressRing>
          <div className="text-sm text-ink-soft">Trust score</div>
        </Card>
        <Card hover={false} className="text-center">
          <div className="font-display text-4xl font-semibold text-ink">{returned}</div>
          <div className="mt-1 text-sm text-ink-soft">Items returned</div>
        </Card>
        <Card hover={false}>
          <p className="mb-2 text-center text-sm font-medium text-ink-soft">Badges</p>
          <div className="flex justify-center gap-5">
            {BADGES.map((b) => {
              const earned = returned >= b.need;
              return (
                <div key={b.key} className={`text-center transition ${earned ? '' : 'opacity-30 grayscale'}`} title={b.label}>
                  <b.icon className={`mx-auto h-7 w-7 ${earned ? 'text-primary-600' : 'text-ink-soft'}`} strokeWidth={1.5} />
                  <div className="mt-1 text-[10px] text-ink-soft">{b.label}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Reward list */}
      {loading ? (
        <GridSkeleton count={3} />
      ) : rewards.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="No rewards yet"
          subtitle="Return a found item and verify it to earn your first learning reward."
        />
      ) : (
        <div className="space-y-5">
          {rewards.map((reward, i) => (
            <motion.div key={reward._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover={false}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">
                    Earned {formatDate(reward.createdAt)}
                  </span>
                  {!reward.acknowledged && (
                    <button onClick={() => ack(reward._id)} className="text-xs font-medium text-primary-600 hover:underline">
                      Mark as seen
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {reward.resources.map((r, idx) => {
                    const Icon = RESOURCE_ICON[r.type] || Link2;
                    return (
                      <a
                        key={idx}
                        href={r.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex gap-3 rounded-xl bg-black/[0.02] p-3 transition hover:bg-primary-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-medium text-ink">{r.title}</p>
                          <p className="text-xs font-medium uppercase tracking-wide text-primary-600">{r.type}</p>
                          {r.reason && <p className="mt-0.5 text-xs text-ink-soft">{r.reason}</p>}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
