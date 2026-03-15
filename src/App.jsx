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
import { ProtectedRoute, GuestRoute } from '@/routes/AuthRoutes';

// ── Contestant module ─────────────────────────────────────────────────────
import CompetitorLayout from '@/layouts/contestant/CompetitorLayout';
import DashboardPage    from '@/features/contestant/pages/DashboardPage';
import TasksPage        from '@/features/contestant/pages/TasksPage';
import TeamsPage        from '@/features/contestant/pages/TeamsPage';
import MetricsPage      from '@/features/contestant/pages/MetricsPage';
import ProfilePage      from '@/features/contestant/pages/ProfilePage';

// ── App ───────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
        <Route index                element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="tasks"         element={<TasksPage />} />
        <Route path="teams"         element={<TeamsPage />} />
        <Route path="metrics"       element={<MetricsPage />} />
        <Route path="profile"       element={<ProfilePage />} />
      </Route>

      {/* ── Legacy /dashboard redirect ── */}
      <Route path="/dashboard" element={<Navigate to="/contestant/dashboard" replace />} />

      {/* ── Fallback ── */}
      <Route path="/"  element={<Navigate to="/login" replace />} />
      <Route path="*"  element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
