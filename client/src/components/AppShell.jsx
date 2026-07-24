import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  FlagOff,
  PackageSearch,
  Shuffle,
  GraduationCap,
  Trophy,
  UserRound,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import SearchBar from './ui/SearchBar.jsx';
import Avatar from './ui/Avatar.jsx';
import Button from './ui/Button.jsx';
import NotificationBell from './NotificationBell.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, auth: true },
  { to: '/browse', label: 'Browse', icon: Compass, auth: false },
  { to: '/report/lost', label: 'Report Lost', icon: FlagOff, auth: true },
  { to: '/report/found', label: 'Report Found', icon: PackageSearch, auth: true },
  { to: '/matches', label: 'Matches', icon: Shuffle, auth: true },
  { to: '/rewards', label: 'Knowledge Rewards', icon: GraduationCap, auth: true },
  { to: '/leaderboard', label: 'Community', icon: Trophy, auth: false },
  { to: '/profile', label: 'Profile', icon: UserRound, auth: true },
];

export default function AppShell() {
  const { isAuthenticated, user, logout, devMode } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user && ['admin', 'security'].includes(user.role);
  const visibleItems = NAV_ITEMS.filter((item) => !item.auth || isAuthenticated);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      {/* Mobile top strip */}
      <div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-ink-soft hover:bg-black/5">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-display text-lg font-semibold text-primary-700">🌿 LOKII</span>
        {isAuthenticated ? <NotificationBell /> : <div className="w-9" />}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
            >
              <SidebarContent
                items={visibleItems}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
                user={user}
                devMode={devMode}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
                closeButton={
                  <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-ink-soft hover:bg-black/5">
                    <X className="h-4 w-4" />
                  </button>
                }
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-hairline bg-surface lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent
            items={visibleItems}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            user={user}
            devMode={devMode}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* Main column */}
      <div className="min-w-0 flex-1">
        {/* Topbar (desktop) */}
        <div className="hidden items-center gap-4 border-b border-hairline bg-surface/80 px-8 py-4 backdrop-blur lg:flex">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search for items, people, or knowledge…"
            className="max-w-md"
          />
          <div className="ml-auto flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button to="/report/lost" size="sm" variant="subtle" icon={Sparkles}>
                  Report
                </Button>
                <NotificationBell />
                <div className="relative">
                  <button onClick={() => setMenuOpen((o) => !o)} className="block">
                    <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
                  </button>
                  <AnimatePresence>
                    {menuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl bg-surface py-1 shadow-lift ring-1 ring-hairline"
                        >
                          <div className="border-b border-hairline px-4 py-2">
                            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                            <p className="truncate text-xs capitalize text-ink-soft">{user?.role}</p>
                          </div>
                          <NavLink to="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-ink-soft hover:bg-black/[0.03]">
                            View profile
                          </NavLink>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger hover:bg-red-50"
                          >
                            <LogOut className="h-3.5 w-3.5" /> Sign out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">Log in</Button>
                <Button to="/register" size="sm">Get started</Button>
              </>
            )}
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-hairline px-8 py-6 text-center text-xs text-ink-soft/70">
          🌿 LOKII — Find. Return. Inspire. · Every returned item strengthens our community.
        </footer>
      </div>
    </div>
  );
}

function SidebarContent({ items, isAdmin, isAuthenticated, user, devMode, onNavigate, onLogout, closeButton }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <NavLink to="/" className="flex flex-col" onClick={onNavigate}>
          <span className="font-display text-xl font-semibold text-primary-700">🌿 LOKII</span>
          <span className="text-[11px] text-ink-soft">Find. Return. Inspire.</span>
        </NavLink>
        {closeButton}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-soft hover:bg-black/[0.03] hover:text-ink'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-soft hover:bg-black/[0.03] hover:text-ink'
              }`
            }
          >
            <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Admin
          </NavLink>
        )}
      </nav>

      {devMode && (
        <div className="mx-3 mb-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700">
          Dev auth mode — any email signs you in.
        </div>
      )}

      {isAuthenticated ? (
        <button
          onClick={onLogout}
          className="mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-black/[0.03]"
        >
          <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-xs capitalize text-ink-soft">{user?.role}</p>
          </div>
          <LogOut className="h-4 w-4 shrink-0 text-ink-soft" />
        </button>
      ) : (
        <div className="mx-3 mb-4 space-y-2">
          <Button to="/login" variant="outline" className="w-full" onClick={onNavigate}>Log in</Button>
          <Button to="/register" className="w-full" onClick={onNavigate}>Get started</Button>
        </div>
      )}
    </div>
  );
}
