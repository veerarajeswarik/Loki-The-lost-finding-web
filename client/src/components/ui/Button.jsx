import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-primary text-white shadow-soft hover:bg-primary-600 hover:shadow-card disabled:hover:bg-primary',
  secondary:
    'bg-surface text-primary-700 ring-1 ring-primary-200 hover:bg-primary-50 hover:ring-primary-300',
  outline:
    'bg-transparent text-ink ring-1 ring-hairline hover:bg-black/[0.03] hover:ring-ink/20',
  ghost: 'bg-transparent text-ink-soft hover:bg-black/5 hover:text-ink',
  danger: 'bg-danger text-white hover:bg-red-700',
  subtle: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5',
  icon: 'p-2.5 rounded-xl',
};

/**
 * Universal button primitive. Renders a <Link> when `to` is provided,
 * otherwise a native <button>. Supports icons, loading state, and a subtle
 * press micro-interaction.
 */
const Button = forwardRef(function Button(
  {
    to,
    href,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const classes = `inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2} />
      )}
      {children}
      {!loading && IconRight && <IconRight className="h-4 w-4" strokeWidth={2} />}
    </>
  );

  const Comp = motion.button;
  const tap = disabled || loading ? {} : { whileTap: { scale: 0.97 } };

  if (to) {
    return (
      <motion.div className="inline-block" {...tap}>
        <Link to={to} className={classes} ref={ref} {...props}>
          {content}
        </Link>
      </motion.div>
    );
  }

  if (href) {
    return (
      <motion.a href={href} className={classes} ref={ref} {...tap} {...props}>
        {content}
      </motion.a>
    );
  }

  return (
    <Comp ref={ref} className={classes} disabled={disabled || loading} {...tap} {...props}>
      {content}
    </Comp>
  );
});

export default Button;
