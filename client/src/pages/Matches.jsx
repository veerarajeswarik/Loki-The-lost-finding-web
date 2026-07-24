import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { useMatches } from '../hooks/useMatches.js';
import MatchCard from '../components/MatchCard.jsx';
import { GridSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Matches() {
  const { matches, loading } = useMatches();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-ink">Your matches</h1>
        <p className="text-sm text-ink-soft">AI-suggested matches for your lost and found items.</p>
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={Shuffle}
          title="No matches yet"
          subtitle="When our AI finds a possible match for your items, it'll appear here."
          actionLabel="Report an item"
          actionTo="/report/lost"
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m, i) => (
            <motion.div key={m._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
              <MatchCard match={m} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
