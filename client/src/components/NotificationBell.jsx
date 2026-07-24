import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Search, ShieldCheck, ClipboardCheck, PartyPopper, GraduationCap, Megaphone } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.jsx';
import { timeAgo } from '../utils/format.js';

const TYPE_ICON = {
  match_found: Search,
  verification_request: ShieldCheck,
  verification_result: ClipboardCheck,
  recovery_complete: PartyPopper,
  reward_earned: GraduationCap,
};

const TARGET = (n) => {
  if (n.data?.matchId) return `/matches/${n.data.matchId}`;
  if (n.data?.rewardId) return '/rewards';
  return '/dashboard';
};

export default function NotificationBell() {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = async (n) => {
    if (!n.read) await markRead(n._id);
    setOpen(false);
    navigate(TARGET(n));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2.5 text-ink-soft transition hover:bg-black/5 hover:text-ink"
        aria-label="Notifications"
      >
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl bg-surface shadow-lift ring-1 ring-hairline"
            >
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <span className="text-sm font-semibold text-ink">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs font-medium text-primary-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Megaphone className="h-6 w-6 text-ink-soft/40" />
                    <p className="text-sm text-ink-soft">No notifications yet</p>
                  </div>
                ) : (
                  items.map((n) => {
                    const Icon = TYPE_ICON[n.type] || Megaphone;
                    return (
                      <button
                        key={n._id}
                        onClick={() => handleClick(n)}
                        className={`flex w-full gap-3 border-b border-hairline/70 px-4 py-3 text-left transition hover:bg-black/[0.02] ${
                          n.read ? '' : 'bg-primary-50/40'
                        }`}
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">{n.title}</p>
                          <p className="line-clamp-2 text-xs text-ink-soft">{n.body}</p>
                          <p className="mt-0.5 text-[11px] text-ink-soft/70">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
