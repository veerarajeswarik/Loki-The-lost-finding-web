import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MarketingLayout from './components/MarketingLayout.jsx';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './hooks/useAuth.js';
import { initPushNotifications } from './services/fcm.js';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReportItem from './pages/ReportItem.jsx';
import Browse from './pages/Browse.jsx';
import ItemDetails from './pages/ItemDetails.jsx';
import Matches from './pages/Matches.jsx';
import MatchDetails from './pages/MatchDetails.jsx';
import VerifyOwnership from './pages/VerifyOwnership.jsx';
import Rewards from './pages/Rewards.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();

  // Register web push once the user is signed in.
  useEffect(() => {
    if (isAuthenticated) initPushNotifications();
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Marketing shell: simple top nav, no sidebar */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* App shell: sidebar + topbar, used for browse + all authenticated flows */}
      <Route element={<AppShell />}>
        <Route path="/browse" element={<Browse />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/report/lost" element={<ProtectedRoute><ReportItem type="lost" /></ProtectedRoute>} />
        <Route path="/report/found" element={<ProtectedRoute><ReportItem type="found" /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/matches/:id" element={<ProtectedRoute><MatchDetails /></ProtectedRoute>} />
        <Route path="/matches/:id/verify" element={<ProtectedRoute><VerifyOwnership /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin', 'security']}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
