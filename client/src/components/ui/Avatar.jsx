const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ src, name, size = 'md', ring = false, className = '' }) {
  const sizeCls = SIZES[size] || SIZES.md;
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-400 to-primary-700 font-semibold text-white ${sizeCls} ${
        ring ? 'ring-2 ring-surface ring-offset-2 ring-offset-canvas' : ''
      } ${className}`}
    >
      {src ? <img src={src} alt={name || 'avatar'} className="h-full w-full object-cover" /> : initials(name || 'U')}
    </div>
  );
}
