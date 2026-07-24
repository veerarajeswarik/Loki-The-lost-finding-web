import { ArrowLeftRight } from 'lucide-react';
import Card from './ui/Card.jsx';
import { MatchStatusBadge, ConfidenceBar } from './Badges.jsx';
import { timeAgo } from '../utils/format.js';

function MiniItem({ item, label }) {
  const cover = item?.images?.[0]?.url;
  return (
    <div className="flex flex-1 items-center gap-2.5">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-primary-50/60">
        {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-ink-soft/70">{label}</p>
        <p className="line-clamp-1 text-sm font-medium text-ink">{item?.title || 'Item'}</p>
      </div>
    </div>
  );
}

export default function MatchCard({ match }) {
  return (
    <Card to={`/matches/${match._id}`}>
      <div className="mb-3 flex items-center justify-between">
        <MatchStatusBadge status={match.status} />
        <span className="text-xs text-ink-soft/70">{timeAgo(match.createdAt)}</span>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <MiniItem item={match.lostItem} label="Lost" />
        <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-primary-400" />
        <MiniItem item={match.foundItem} label="Found" />
      </div>
      <ConfidenceBar score={match.aiConfidenceScore} />
      {match.aiReasoning && (
        <p className="mt-2.5 line-clamp-2 rounded-lg bg-primary-50/50 px-2.5 py-1.5 text-xs italic text-ink-soft">
          {match.aiReasoning}
        </p>
      )}
    </Card>
  );
}
