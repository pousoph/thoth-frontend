import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import emailGif from "../../assets/imgs/emailSent.gif";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { verifyAccount } from "../../services/authService";
import { PENDING_VERIFY_STORAGE_KEY } from "../../constants/auth";
import "../../styles/pages/verifyAccount.css";

const VerifyAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const userId = location.state?.userId ?? sessionStorage.getItem(PENDING_VERIFY_STORAGE_KEY);

    const handleCodeChange = useCallback((e) => {
        setCode(e.target.value);
        setError("");
    }, []);

    const handleVerify = useCallback(async () => {
        if (!code.trim()) {
            setError("Ingresa el código de verificación.");
            return;
        }
        if (!userId) {
            setError("Sesión inválida. Vuelve a registrarte.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await verifyAccount(code.trim(), Number(userId));
            sessionStorage.removeItem(PENDING_VERIFY_STORAGE_KEY);
            navigate("/login", { state: { message: "Cuenta verificada. Ya puedes iniciar sesión." } });
        } catch (err) {
            setError(err.message || "No se pudo verificar la cuenta.");
        } finally {
            setLoading(false);
        }
    }, [code, userId, navigate]);

    const goToRegister = useCallback(() => navigate("/register"), [navigate]);

    if (!userId) {
        return (
            <AuthLayout>
                <div className="verify-container fade-in">
                    <p className="auth-error">
                        No hay una cuenta pendiente de verificar. Por favor, regístrate primero.
                    </p>
                    <Button onClick={goToRegister}>
                        Ir a registrarse
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="verify-container fade-in">

                <div className="verify-icon">
                    <img
                        src={emailGif}
                        alt="Correo enviado"
                        className="verify-gif"
                    />
                </div>

                <h1>Revisa tu correo</h1>

                <p className="verify-text">
                    Hemos enviado un código de verificación a tu correo electrónico.
                    Ingresa el código para activar tu cuenta.
                </p>

                <Input
                    label="Código de verificación"
                    placeholder="Ej. 123456"
                    value={code}
                    onChange={handleCodeChange}
                    maxLength={6}
                />

                {error && <p className="auth-error">{error}</p>}

                <Button onClick={handleVerify} disabled={loading}>
                    {loading ? "Verificando..." : "Verificar cuenta"}
                </Button>

                <p className="verify-helper">
                    ¿No recibiste el correo? Revisa spam o espera unos minutos.
                </p>

            </div>
        </AuthLayout>
    );
};

export default VerifyAccount;
