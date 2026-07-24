import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { apiGet } from '../services/api.js';
import { LineSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Card from '../components/ui/Card.jsx';
import Avatar from '../components/ui/Avatar.jsx';

const MEDAL_CLS = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/rewards/leaderboard')
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-medium text-ink">Community Leaderboard</h1>
        <p className="text-sm text-ink-soft">Celebrating the campus's most honest finders.</p>
      </div>

      {loading ? (
        <Card hover={false}>
          <LineSkeleton rows={6} />
        </Card>
      ) : users.length === 0 ? (
        <EmptyState icon={Trophy} title="No returns yet" subtitle="Be the first to return an item and top the leaderboard!" />
      ) : (
        <Card hover={false} padding="p-2" className="divide-y divide-hairline">
          {users.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-3 py-3"
            >
              <div className="w-7 text-center text-sm font-bold text-ink-soft/70">
                {i < 3 ? <Trophy className={`mx-auto h-4 w-4 ${MEDAL_CLS[i]}`} /> : i + 1}
              </div>
              <Avatar src={u.avatarUrl} name={u.name} size="sm" />
              <div className="flex-1">
                <p className="font-medium text-ink">{u.name}</p>
                <p className="text-xs text-ink-soft/70">
                  {u.department || u.role} · Trust {u.stats?.trustScore ?? 0}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-semibold text-primary-600">{u.stats?.itemsReturned || 0}</p>
                <p className="text-[11px] text-ink-soft/70">returns</p>
              </div>
            </motion.div>
          ))}
        </Card>
      )}
    </div>
  );
}
