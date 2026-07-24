import { motion } from 'framer-motion';

/**
 * Segmented-control tabs with a sliding active indicator.
 * tabs: [{ key, label, icon? }]
 */
export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-xl bg-black/[0.04] p-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              isActive ? 'text-ink' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={`tab-pill-${tabs.map((t) => t.key).join('-')}`}
                className="absolute inset-0 rounded-lg bg-surface shadow-xs"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
