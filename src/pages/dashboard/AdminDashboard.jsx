import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/pages/dashboard.css";

export const AdminDashboard = () => {
    const { name, last_name } = useAuth();

    return (
        <div className="dashboard dashboard--admin">
            <header className="dashboard-header">
                <h1>Dashboard del Admin</h1>
                <p className="dashboard-welcome">
                    Bienvenido, {name} {last_name}
                </p>
            </header>
            <main className="dashboard-main">
                <div className="dashboard-card">
                    <h2>Administración</h2>
                    <p>Contenido del dashboard del administrador.</p>
                </div>
            </main>
        </div>
    );
};
