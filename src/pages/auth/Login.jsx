import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { loginUser } from "../../services/authService.js";
import thothLogo from "../../assets/logos/thothLogo.png";

export const Login = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await loginUser(formData.username, formData.password);

            // Redirigir al dashboard
            navigate("/dashboard");

        } catch (err) {
            setError("Usuario o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="auth-header">
                <img
                    src={thothLogo}
                    alt="Thoth Logo"
                    className="auth-logo"
                />
                <h1>Bienvenido a Thoth</h1>
                <p>Gestión del Grupo de Programación Competitiva</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <Input
                    label="Correo institucional"
                    type="text"
                    name="username"
                    placeholder="usuario@unbosque.edu.co"
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
