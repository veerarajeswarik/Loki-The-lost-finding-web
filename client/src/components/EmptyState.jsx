import { Sprout } from 'lucide-react';
import Button from './ui/Button.jsx';

export default function EmptyState({ icon: Icon = Sprout, title, subtitle, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline bg-black/[0.015] py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
        <Icon className="h-7 w-7 text-primary-600" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{subtitle}</p>}
      {actionLabel && actionTo && (
        <Button to={actionTo} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
