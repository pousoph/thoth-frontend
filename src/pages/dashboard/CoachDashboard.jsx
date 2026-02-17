import { useAuth } from "../../context/AuthContext.jsx";
import "../../styles/pages/dashboard.css";

export const CoachDashboard = () => {
    const { name, last_name } = useAuth();

    return (
        <div className="dashboard dashboard--coach">
            <header className="dashboard-header">
                <h1>Dashboard del Coach</h1>
                <p className="dashboard-welcome">
                    Bienvenido, {name} {last_name}
                </p>
            </header>
            <main className="dashboard-main">
                <div className="dashboard-card">
                    <h2>Gestión del grupo</h2>
                    <p>Contenido del dashboard del coach.</p>
                </div>
            </main>
        </div>
    );
};
