import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Base surface card. Pass `to` to make the whole card a router link with a
 * subtle lift-on-hover interaction; omit for a static container.
 */
const Card = forwardRef(function Card(
  { to, hover = Boolean(to), padding = 'p-5', className = '', children, ...props },
  ref
) {
  const classes = `rounded-2xl bg-surface ${padding} shadow-soft ring-1 ring-hairline ${className}`;

  if (to) {
    return (
      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
        <Link to={to} ref={ref} className={`block ${classes} transition-shadow hover:shadow-card`} {...props}>
          {children}
        </Link>
      </motion.div>
    );
  }

  if (hover) {
    return (
      <motion.div
        ref={ref}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`${classes} transition-shadow hover:shadow-card`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

export default Card;
