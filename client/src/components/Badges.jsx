import { Circle, TriangleAlert, ShieldCheck, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import Badge from './ui/Badge.jsx';
import { STATUS_META, MATCH_STATUS_META } from '../utils/constants.js';

const STATUS_ICON = {
  open: Circle,
  matched: TriangleAlert,
  pending_verification: ShieldCheck,
  recovered: CheckCircle2,
  closed: XCircle,
};

const MATCH_ICON = {
  suggested: Sparkles,
  accepted: TriangleAlert,
  rejected: XCircle,
  verified: ShieldCheck,
  completed: CheckCircle2,
};

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone} icon={STATUS_ICON[status]}>{meta.label}</Badge>;
}

export function MatchStatusBadge({ status }) {
  const meta = MATCH_STATUS_META[status] || { label: status, tone: 'neutral' };
  return <Badge tone={meta.tone} icon={MATCH_ICON[status]}>{meta.label}</Badge>;
}

export function TypeBadge({ type }) {
  return (
    <Badge tone={type === 'lost' ? 'danger' : 'success'}>
      {type === 'lost' ? 'Lost' : 'Found'}
    </Badge>
  );
}

export function ConfidenceBar({ score }) {
  const tone = score >= 80 ? 'bg-primary' : score >= 60 ? 'bg-warning' : 'bg-ink-soft/50';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-medium text-ink-soft">
          <Sparkles className="h-3 w-3" /> AI confidence
        </span>
        <span className="font-semibold text-ink">{score}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
