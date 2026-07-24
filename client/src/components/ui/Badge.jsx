const TONES = {
  neutral: 'bg-black/[0.04] text-ink-soft',
  primary: 'bg-primary-50 text-primary-700',
  success: 'bg-primary-50 text-primary-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-danger',
  info: 'bg-sky-50 text-sky-700',
  accent: 'bg-accent/10 text-primary-700',
};

/**
 * Generic pill badge/tag primitive. Domain-specific badges (StatusBadge,
 * TypeBadge, etc.) compose this from components/Badges.jsx.
 */
export default function Badge({ tone = 'neutral', icon: Icon, size = 'md', className = '', children }) {
  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeCls} ${TONES[tone]} ${className}`}>
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.5} />}
      {children}
    </span>
  );
}
