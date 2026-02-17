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

export const ContestantDashboard = () => {
    const { name, last_name, level, logout } = useAuth();
    const navigate = useNavigate();
    const levelKey = ["aprendiz", "basica", "intermedia", "avanzada"].includes(
        level
    )
        ? level
        : "aprendiz";
    const displayName = [name, last_name].filter(Boolean).join(" ") || "Usuario";

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div
            className="contestant-dashboard"
            data-level={levelKey}
        >
            <header className="cd-header">
                <div className="cd-header-left">
                    <img
                        src={thothLogo}
                        alt="Thoth"
                        className="cd-logo"
                    />
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
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                >
                    Cerrar sesión
                </button>
            </header>

            <main className="cd-main">
                <h1 className="cd-welcome">
                    ¡Bienvenido, {displayName}!
                </h1>

                <nav className="cd-tabs" role="tablist" aria-label="Navegación principal">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `cd-tab ${isActive ? "cd-tab--active" : ""}`
                        }
                        end
                    >
                        Dashboard
                    </NavLink>
                    <NavLink to="/dashboard/tareas" className={({ isActive }) =>
                        `cd-tab ${isActive ? "cd-tab--active" : ""}`
                    }>
                        Tareas
                    </NavLink>
                    <NavLink to="/dashboard/equipo" className={({ isActive }) =>
                        `cd-tab ${isActive ? "cd-tab--active" : ""}`
                    }>
                        Equipo
                    </NavLink>
                    <NavLink to="/dashboard/perfil" className={({ isActive }) =>
                        `cd-tab ${isActive ? "cd-tab--active" : ""}`
                    }>
                        Perfil
                    </NavLink>
                </nav>

                <section className="cd-kpis" aria-label="Resumen de métricas">
                    <article className="cd-kpi">
                        <div className="cd-kpi-content">
                            <span className="cd-kpi-label">Tareas completadas</span>
                            <span className="cd-kpi-value">2/3</span>
                        </div>
                        <div className="cd-kpi-icon" aria-hidden="true" />
                    </article>
                    <article className="cd-kpi">
                        <div className="cd-kpi-content">
                            <span className="cd-kpi-label">Equipo</span>
                            <span className="cd-kpi-value">Labubus</span>
                        </div>
                        <div className="cd-kpi-icon" aria-hidden="true" />
                    </article>
                    <article className="cd-kpi">
                        <div className="cd-kpi-content">
                            <span className="cd-kpi-label">Competencias</span>
                            <span className="cd-kpi-value">8</span>
                        </div>
                        <div className="cd-kpi-icon" aria-hidden="true" />
                    </article>
                    <article className="cd-kpi">
                        <div className="cd-kpi-content">
                            <span className="cd-kpi-label">Posición promedio</span>
                            <span className="cd-kpi-value">#06</span>
                        </div>
                        <div className="cd-kpi-icon" aria-hidden="true" />
                    </article>
                </section>

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
                                    <circle cx="0" cy="90" r="4" fill="currentColor" />
                                    <circle cx="40" cy="75" r="4" fill="currentColor" />
                                    <circle cx="80" cy="50" r="4" fill="currentColor" />
                                    <circle cx="120" cy="60" r="4" fill="currentColor" />
                                    <circle cx="160" cy="35" r="4" fill="currentColor" />
                                    <circle cx="200" cy="45" r="4" fill="currentColor" />
                                    <circle cx="240" cy="25" r="4" fill="currentColor" />
                                    <circle cx="280" cy="20" r="4" fill="currentColor" />
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
                        <h2 className="cd-chart-title">
                            Distribución de tareas
                        </h2>
                        <div className="cd-donut-wrap">
                            <div
                                className="cd-donut"
                                aria-hidden="true"
                            />
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
                            <div className="cd-bar-row">
                                <span className="cd-bar-label">CCPL</span>
                                <div className="cd-bar-track">
                                    <div
                                        className="cd-bar-fill"
                                        style={{ width: "85%" }}
                                    />
                                </div>
                                <span className="cd-bar-value">2</span>
                            </div>
                            <div className="cd-bar-row">
                                <span className="cd-bar-label">RPC</span>
                                <div className="cd-bar-track">
                                    <div
                                        className="cd-bar-fill"
                                        style={{ width: "0%" }}
                                    />
                                </div>
                                <span className="cd-bar-value">0</span>
                            </div>
                            <div className="cd-bar-row">
                                <span className="cd-bar-label">Maratón</span>
                                <div className="cd-bar-track">
                                    <div
                                        className="cd-bar-fill"
                                        style={{ width: "60%" }}
                                    />
                                </div>
                                <span className="cd-bar-value">1</span>
                            </div>
                        </div>
                    </section>

                    <section className="cd-chart-card">
                        <h2 className="cd-chart-title">Últimas competencias</h2>
                        <ul className="cd-comp-list">
                            <li className="cd-comp-item">
                                <span className="cd-comp-name">
                                    Maratón Interna UEB 2024
                                </span>
                                <span className="cd-comp-meta">2024-07-10</span>
                                <span className="cd-comp-rank">#4</span>
                                <span className="cd-comp-pts">100 pts</span>
                            </li>
                            <li className="cd-comp-item">
                                <span className="cd-comp-name">CCPL - Fecha 2</span>
                                <span className="cd-comp-meta">2024-04-15</span>
                                <span className="cd-comp-rank">#6</span>
                                <span className="cd-comp-pts">65 pts</span>
                            </li>
                            <li className="cd-comp-item">
                                <span className="cd-comp-name">CCPL - Fecha 1</span>
                                <span className="cd-comp-meta">2024-03-10</span>
                                <span className="cd-comp-rank">#8</span>
                                <span className="cd-comp-pts">50 pts</span>
                            </li>
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    );
};
