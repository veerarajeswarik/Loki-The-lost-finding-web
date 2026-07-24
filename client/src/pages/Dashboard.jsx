import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FlagOff, PackageSearch, Shuffle, ArrowRight, ShieldCheck, GraduationCap, Bell } from 'lucide-react';
import { apiGet } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useItems } from '../hooks/useItems.js';
import { useMatches } from '../hooks/useMatches.js';
import { useNotifications } from '../context/NotificationContext.jsx';
import ItemCard from '../components/ItemCard.jsx';
import MatchCard from '../components/MatchCard.jsx';
import { GridSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import { ProgressRing } from '../components/ui/Progress.jsx';
import { timeAgo } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [rewards, setRewards] = useState([]);
  const { items, loading: itemsLoading } = useItems({ mine: true, limit: 6 });
  const { matches, loading: matchesLoading } = useMatches();
  const { items: notifs } = useNotifications();

  useEffect(() => {
    apiGet('/users/me/summary').then(setSummary).catch(() => {});
    apiGet('/rewards/mine').then(setRewards).catch(() => {});
  }, []);

  const activeMatches = matches.filter((m) => !['rejected', 'completed'].includes(m.status));
  const trustScore = summary?.stats?.trustScore ?? user?.stats?.trustScore ?? 0;
  const latestResources = rewards[0]?.resources || [];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-medium text-ink">
              Welcome, {user?.name?.split(' ')[0] || 'friend'} 🌿
            </h1>
            <p className="text-sm text-ink-soft">Here's what's happening with your items.</p>
          </div>
          <div className="flex gap-2">
            <Button to="/report/lost" variant="outline" icon={FlagOff} size="sm">Report lost</Button>
            <Button to="/report/found" icon={PackageSearch} size="sm">Report found</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Items reported" value={(summary?.counts?.lost || 0) + (summary?.counts?.found || 0)} />
          <StatTile label="Recovered" value={summary?.counts?.recovered || 0} />
          <StatTile label="Items returned" value={summary?.stats?.itemsReturned || 0} />
          <StatTile label="Trust score" value={trustScore} accent />
        </div>

        {/* Active matches */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Shuffle className="h-4 w-4 text-primary-500" /> Active matches
            </h2>
            <Button to="/matches" variant="ghost" size="sm" iconRight={ArrowRight}>View all</Button>
          </div>
          {matchesLoading ? (
            <GridSkeleton count={3} />
          ) : activeMatches.length === 0 ? (
            <EmptyState
              icon={Shuffle}
              title="No active matches"
              subtitle="Report an item to let our AI find matches for you."
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activeMatches.slice(0, 3).map((m, i) => (
                <motion.div key={m._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <MatchCard match={m} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* My items */}
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">My items</h2>
          {itemsLoading ? (
            <GridSkeleton count={3} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="You haven't reported anything yet"
              subtitle="Lost or found something? Report it and let LOKII help."
              actionLabel="Report an item"
              actionTo="/report/lost"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right rail */}
      <div className="space-y-6">
        <Card hover={false}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-ink">Your Impact</h3>
            {['admin', 'security'].includes(user?.role) && (
              <Button to="/admin" variant="ghost" size="sm" icon={ShieldCheck}>Admin</Button>
            )}
          </div>
          <div className="flex items-center gap-5">
            <ProgressRing value={trustScore} max={100} size={84}>
              <div className="text-center">
                <p className="font-display text-xl font-semibold text-ink">{trustScore}</p>
                <p className="text-[10px] text-ink-soft">Trust</p>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Items returned</span>
                <span className="font-semibold text-ink">{summary?.stats?.itemsReturned || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Items recovered</span>
                <span className="font-semibold text-ink">{summary?.stats?.itemsRecovered || 0}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-semibold text-ink">
              <Bell className="h-4 w-4 text-primary-500" /> Recent activity
            </h3>
          </div>
          {notifs.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">No notifications yet.</p>
          ) : (
            <div className="space-y-3">
              {notifs.slice(0, 4).map((n) => (
                <div key={n._id} className="flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? 'bg-hairline' : 'bg-primary-500'}`} />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium text-ink">{n.title}</p>
                    <p className="text-xs text-ink-soft/70">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-semibold text-ink">
              <GraduationCap className="h-4 w-4 text-primary-500" /> Knowledge Rewards
            </h3>
            <Button to="/rewards" variant="ghost" size="sm">View all</Button>
          </div>
          {latestResources.length === 0 ? (
            <p className="py-4 text-sm text-ink-soft">Return an item to unlock personalized resources.</p>
          ) : (
            <ul className="space-y-2">
              {latestResources.slice(0, 3).map((r, i) => (
                <li key={i} className="rounded-lg bg-primary-50/50 px-3 py-2 text-sm text-ink">
                  {r.title}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatTile({ label, value, accent }) {
  return (
    <Card hover={false} className="text-center">
      <div className={`font-display text-3xl font-semibold ${accent ? 'text-primary-600' : 'text-ink'}`}>{value}</div>
      <div className="mt-1 text-xs text-ink-soft">{label}</div>
    </Card>
  );
}
