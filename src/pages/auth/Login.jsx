import { useState, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { loginUser, getContestantProfile } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import thothLogo from "../../assets/logos/thothLogo.png";

const ROLE_REDIRECTS = {
    coach: "/coach/dashboard",
    admin: "/admin/dashboard",
    contestant: "/dashboard"
};

async function resolveContestantLevel(token, loginLevel) {
    let level = loginLevel ?? "aprendiz";
    try {
        const profile = await getContestantProfile(token);
        if (profile?.level) level = profile.level;
    } catch {
        // Fallback: usar level del login si el perfil falla
    }
    return level;
}

export const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { saveUser, updateLevel } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const initialInfoMessage = location.state?.message ?? "";
    const [infoMessage] = useState(initialInfoMessage);

    const handleChange = useCallback((e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser(formData.username, formData.password);

            saveUser({
                token: data.token,
                role: data.role,
                name: data.name,
                last_name: data.last_name
            });

            const path = ROLE_REDIRECTS[data.role];
            if (path) {
                if (data.role === "contestant") {
                    const level = await resolveContestantLevel(
                        data.token,
                        data.level
                    );
                    updateLevel(level);
                }
                navigate(path, { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } catch {
            setError("Usuario o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    }, [formData.username, formData.password, navigate, saveUser, updateLevel]);

    return (
        <AuthLayout>
            <div className="auth-header">
                <img
                    src={thothLogo}
                    alt="Thoth Logo"
                    className="auth-logo"
                />
                <h1>Bienvenido a Thoth</h1>
                <p>Gestión de Grupo de Programación Competitiva</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                {infoMessage && (
                    <p className="auth-info">
                        {infoMessage}
                    </p>
                )}
                <Input
                    label="Nombre de Usuario"
                    type="text"
                    name="username"
                    placeholder="username"
                    value={formData.username}
                    onChange={handleChange}
                />

                <Input
                    label="Contraseña"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                />

                {error && <p className="auth-error">{error}</p>}

                <Button type="submit" disabled={loading}>
                    {loading ? "Iniciando..." : "Iniciar sesión"}
                </Button>
            </form>

            <div className="auth-footer">
                <span>¿No tienes cuenta?</span>
                <Link to="/register">Registrarse</Link>
            </div>
        </AuthLayout>
    );
};
