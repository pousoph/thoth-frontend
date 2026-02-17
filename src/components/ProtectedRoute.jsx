import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Protege rutas que requieren autenticación.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {"contestant"|"coach"} [props.requiredRole] - Rol requerido; si no se indica, cualquier autenticado puede acceder
 */
export const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, role } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && role !== requiredRole) {
        const redirectMap = {
            coach: "/coach/dashboard",
            admin: "/admin/dashboard",
            contestant: "/dashboard"
        };
        const redirectTo = redirectMap[role] ?? "/dashboard";
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};
