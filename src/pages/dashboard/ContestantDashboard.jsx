import { useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate, NavLink } from "react-router-dom";
import thothLogo from "../../assets/logos/thothLogo.png";
import "../../styles/pages/contestant-dashboard.css";

const LEVEL_LABELS = {
    aprendiz: "Aprendiz",
    basica: "Básica",
    intermedia: "Intermedia",
    avanzada: "Avanzada"
};

const TAB_CLASS_ACTIVE = "cd-tab--active";

function getTabClassName({ isActive }) {
    return `cd-tab ${isActive ? TAB_CLASS_ACTIVE : ""}`;
}

function DashboardHeader({ levelKey, onLogout }) {
    return (
        <header className="cd-header">
            <div className="cd-header-left">
                <img src={thothLogo} alt="Thoth" className="cd-logo" />
                <div className="cd-header-brand">
                    <span className="cd-header-title">Panel de Competidor</span>
                    <span className="cd-header-level">
                        Nivel: {LEVEL_LABELS[levelKey]}
                    </span>
                </div>
            </div>
            <button
                type="button"
                className="cd-logout"
                onClick={onLogout}
                aria-label="Cerrar sesión"
            >
                Cerrar sesión
            </button>
        </header>
    );
}

function DashboardTabs() {
    return (
        <nav className="cd-tabs" aria-label="Navegación principal">
            <NavLink to="/dashboard" className={getTabClassName} end>
                Dashboard
            </NavLink>
            <NavLink to="/dashboard/tareas" className={getTabClassName}>
                Tareas
            </NavLink>
            <NavLink to="/dashboard/equipo" className={getTabClassName}>
                Equipo
            </NavLink>
            <NavLink to="/dashboard/perfil" className={getTabClassName}>
                Perfil
            </NavLink>
        </nav>
    );
}

function DashboardKPIs() {
    const kpis = [
        { label: "Tareas completadas", value: "2/3" },
        { label: "Equipo", value: "Labubus" },
        { label: "Competencias", value: "8" },
        { label: "Posición promedio", value: "#06" }
    ];
    return (
        <section className="cd-kpis" aria-label="Resumen de métricas">
            {kpis.map((k) => (
                <article key={k.label} className="cd-kpi">
                    <div className="cd-kpi-content">
                        <span className="cd-kpi-label">{k.label}</span>
                        <span className="cd-kpi-value">{k.value}</span>
                    </div>
                    <div className="cd-kpi-icon" aria-hidden="true" />
                </article>
            ))}
        </section>
    );
}

function DashboardCharts() {
    return (
        <div className="cd-charts">
            <section className="cd-chart-card cd-chart-card--wide">
                <h2 className="cd-chart-title">
                    Rendimiento en competencias
                </h2>
                <div className="cd-line-chart">
                    <div className="cd-line-chart-area">
                        <svg
                            className="cd-line-chart-svg"
                            viewBox="0 0 280 120"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polyline
                                points="0,90 40,75 80,50 120,60 160,35 200,45 240,25 280,20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {[0, 40, 80, 120, 160, 200, 240, 280].map(
                                (cx, i) => (
                                    <circle
                                        key={cx}
                                        cx={cx}
                                        cy={[90, 75, 50, 60, 35, 45, 25, 20][i]}
                                        r="4"
                                        fill="currentColor"
                                    />
                                )
                            )}
                        </svg>
                    </div>
                    <div className="cd-line-chart-labels">
                        <span>PL - Fecha 1</span>
                        <span>PL - Fecha 2</span>
                        <span>Maratón Interna</span>
                    </div>
                </div>
            </section>

            <section className="cd-chart-card">
                <h2 className="cd-chart-title">Distribución de tareas</h2>
                <div className="cd-donut-wrap">
                    <div className="cd-donut" aria-hidden="true" />
                    <div className="cd-donut-legend">
                        <span className="cd-donut-legend-item cd-donut-legend-item--done">
                            Completadas: 3
                        </span>
                        <span className="cd-donut-legend-item cd-donut-legend-item--pending">
                            Pendientes: 0
                        </span>
                    </div>
                </div>
            </section>

            <section className="cd-chart-card">
                <h2 className="cd-chart-title">Competencias por tipo</h2>
                <div className="cd-bar-chart">
                    {[
                        { label: "CCPL", width: "85%", value: "2" },
                        { label: "RPC", width: "0%", value: "0" },
                        { label: "Maratón", width: "60%", value: "1" }
                    ].map((row) => (
                        <div key={row.label} className="cd-bar-row">
                            <span className="cd-bar-label">{row.label}</span>
                            <div className="cd-bar-track">
                                <div
                                    className="cd-bar-fill"
                                    style={{ width: row.width }}
                                />
                            </div>
                            <span className="cd-bar-value">{row.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cd-chart-card">
                <h2 className="cd-chart-title">Últimas competencias</h2>
                <ul className="cd-comp-list">
                    {[
                        {
                            name: "Maratón Interna UEB 2024",
                            date: "2024-07-10",
                            rank: "#4",
                            pts: "100 pts"
                        },
                        {
                            name: "CCPL - Fecha 2",
                            date: "2024-04-15",
                            rank: "#6",
                            pts: "65 pts"
                        },
                        {
                            name: "CCPL - Fecha 1",
                            date: "2024-03-10",
                            rank: "#8",
                            pts: "50 pts"
                        }
                    ].map((c) => (
                        <li key={c.name} className="cd-comp-item">
                            <span className="cd-comp-name">{c.name}</span>
                            <span className="cd-comp-meta">{c.date}</span>
                            <span className="cd-comp-rank">{c.rank}</span>
                            <span className="cd-comp-pts">{c.pts}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

export const ContestantDashboard = () => {
    const { name, last_name, level, logout } = useAuth();
    const navigate = useNavigate();
    const levelKey = ["aprendiz", "basica", "intermedia", "avanzada"].includes(
        level
    )
        ? level
        : "aprendiz";
    const displayName = [name, last_name].filter(Boolean).join(" ") || "Usuario";

    const handleLogout = useCallback(() => {
        logout();
        navigate("/login", { replace: true });
    }, [logout, navigate]);

    return (
        <div className="contestant-dashboard" data-level={levelKey}>
            <DashboardHeader levelKey={levelKey} onLogout={handleLogout} />
            <main className="cd-main">
                <h1 className="cd-welcome">¡Bienvenido, {displayName}!</h1>
                <DashboardTabs />
                <DashboardKPIs />
                <DashboardCharts />
            </main>
        </div>
    );
};
