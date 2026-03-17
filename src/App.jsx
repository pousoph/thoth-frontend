import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import '@/styles/globals.css';
import '@/styles/auth.css';
import '@/styles/components.css';

// ── Auth module ───────────────────────────────────────────────────────────
import AuthLayout         from '@/layouts/auth/AuthLayout';
import LoginPage          from '@/features/auth/pages/LoginPage';
import RegisterPage       from '@/features/auth/pages/RegisterPage';
import VerifyAccountPage  from '@/features/auth/pages/VerifyAccountPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import { ProtectedRoute, GuestRoute, CoachRoute, AdminRoute } from '@/routes/AuthRoutes';

// ── Contestant module ─────────────────────────────────────────────────────
import CompetitorLayout from '@/layouts/contestant/CompetitorLayout';
import ContestantDashboard from '@/features/contestant/pages/DashboardPage';
import TasksPageContestant from '@/features/contestant/pages/TasksPage';
import TeamsPageContestant from '@/features/contestant/pages/TeamsPage';
import MetricsPage         from '@/features/contestant/pages/MetricsPage';
import ProfilePage         from '@/features/contestant/pages/ProfilePage';

// ── Coach module ──────────────────────────────────────────────────────────
import CoachLayout       from '@/layouts/coach/CoachLayout';
import CoachDashboard    from '@/features/coach/pages/DashboardPage';
import CoachTeams        from '@/features/coach/pages/TeamsPage';
import CoachTeamDetail   from '@/features/coach/pages/TeamDetailPage';
import CoachCompetitors  from '@/features/coach/pages/CompetitorsPage';
import CoachTasks        from '@/features/coach/pages/TasksPage';
import CoachAnalytics    from '@/features/coach/pages/AnalyticsPage';

// ── Smart redirect post-login ─────────────────────────────────────────────
import useAuthStore from '@/store/authStore';

const RoleRedirect = () => {
  const role = useAuthStore((s) => s.getRole());
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'coach') return <Navigate to="/coach/dashboard" replace />;
  return <Navigate to="/contestant/dashboard" replace />;
};

// ── Shared pages ────────────────────────────────────────────────────────
import LeaguePage              from '@/features/shared/pages/LeaguePage';
import LevelChangesPage        from '@/features/shared/pages/LevelChangesPage';
import CodeforcesRankingPage   from '@/features/shared/pages/CodeforcesRankingPage';

// ── Admin module ──────────────────────────────────────────────────────────
import AdminLayout          from '@/layouts/admin/AdminLayout';
import AdminDashboardPage   from '@/features/admin/pages/AdminDashboardPage';
import AdminCoachQueuePage  from '@/features/admin/pages/AdminCoachQueuePage';
import AdminContestsPage      from '@/features/admin/pages/AdminContestsPage';
import AdminContestantsPage  from '@/features/admin/pages/AdminContestantsPage';

// ── App ───────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Routes>
      {/* ── Auth routes ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/verify-account"  element={<VerifyAccountPage />} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      </Route>

      {/* ── Contestant routes ── */}
      <Route
        path="/contestant"
        element={<ProtectedRoute><CompetitorLayout /></ProtectedRoute>}
      >
        <Route index              element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<ContestantDashboard />} />
        <Route path="tasks"       element={<TasksPageContestant />} />
        <Route path="teams"       element={<TeamsPageContestant />} />
        <Route path="metrics"     element={<MetricsPage />} />
        <Route path="league"      element={<LeaguePage />} />
        <Route path="ascensos"    element={<LevelChangesPage />} />
        <Route path="cf-ranking"  element={<CodeforcesRankingPage />} />
        <Route path="profile"     element={<ProfilePage />} />
      </Route>

      {/* ── Admin routes ── */}
      <Route
        path="/admin"
        element={<AdminRoute><AdminLayout /></AdminRoute>}
      >
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<AdminDashboardPage />} />
        <Route path="coaches"       element={<AdminCoachQueuePage />} />
        <Route path="contests"      element={<AdminContestsPage />} />
        <Route path="contestants"   element={<AdminContestantsPage />} />
        <Route path="league"        element={<LeaguePage />} />
        <Route path="ascensos"      element={<LevelChangesPage />} />
        <Route path="cf-ranking"    element={<CodeforcesRankingPage />} />
      </Route>

      {/* ── Coach routes ── */}
      <Route
        path="/coach"
        element={<CoachRoute><CoachLayout /></CoachRoute>}
      >
        <Route index                    element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"         element={<CoachDashboard />} />
        <Route path="teams"             element={<CoachTeams />} />
        <Route path="teams/:teamId"     element={<CoachTeamDetail />} />
        <Route path="competitors"       element={<CoachCompetitors />} />
        <Route path="tasks"             element={<CoachTasks />} />
        <Route path="analytics"         element={<CoachAnalytics />} />
        <Route path="league"            element={<LeaguePage />} />
        <Route path="ascensos"          element={<LevelChangesPage />} />
        <Route path="cf-ranking"        element={<CodeforcesRankingPage />} />
      </Route>

      {/* ── Smart redirect post-login (según rol) ── */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>}
      />

      {/* ── Fallback ── */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
