import { motion } from 'framer-motion';

export function ProgressBar({ value = 0, max = 100, tone = 'primary', className = '', trackClassName = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = { primary: 'bg-primary', accent: 'bg-accent', warning: 'bg-warning', danger: 'bg-danger' }[tone] || 'bg-primary';
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-black/[0.06] ${trackClassName}`}>
      <motion.div
        className={`h-full rounded-full ${fill} ${className}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

/**
 * Circular progress ring — used for XP / impact level indicators.
 */
export function ProgressRing({ value = 0, max = 100, size = 88, strokeWidth = 8, color = '#0F7B43', children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, value / max));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E8ECE9" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
