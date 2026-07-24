import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from './ui/Button.jsx';

const LINKS = [
  { to: '/browse', label: 'Browse' },
  { to: '/leaderboard', label: 'Community' },
];

export default function MarketingLayout() {
  const { isAuthenticated, devMode } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/80 backdrop-blur">
        {devMode && (
          <div className="bg-amber-50 py-1 text-center text-[11px] font-medium text-amber-700">
            Dev auth mode — Firebase not configured. Any email logs you in.
          </div>
        )}
        <nav className="container-shell flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold text-primary-700">🌿 LOKII</span>
          </NavLink>
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-soft hover:bg-black/[0.03] hover:text-ink'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button to="/dashboard" size="sm">Dashboard</Button>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">Log in</Button>
                <Button to="/register" size="sm">Get started</Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-hairline py-8 text-center text-xs text-ink-soft/70">
        🌿 LOKII — Find. Return. Inspire. · Every returned item strengthens our community.
      </footer>
    </div>
  );
}
