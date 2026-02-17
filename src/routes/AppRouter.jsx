import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/auth/Login.jsx";
import { Register } from "../pages/auth/Register.jsx";
import VerifyAccount from "../pages/auth/VerifyAccount.jsx";
import { ContestantDashboard } from "../pages/dashboard/ContestantDashboard.jsx";
import { CoachDashboard } from "../pages/dashboard/CoachDashboard.jsx";
import { AdminDashboard } from "../pages/dashboard/AdminDashboard.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute.jsx";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-account" element={<VerifyAccount />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requiredRole="contestant">
                            <ContestantDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/tareas"
                    element={
                        <ProtectedRoute requiredRole="contestant">
                            <ContestantDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/equipo"
                    element={
                        <ProtectedRoute requiredRole="contestant">
                            <ContestantDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/perfil"
                    element={
                        <ProtectedRoute requiredRole="contestant">
                            <ContestantDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/coach/dashboard"
                    element={
                        <ProtectedRoute requiredRole="coach">
                            <CoachDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />
            </Routes>
        </BrowserRouter>
    );
};
