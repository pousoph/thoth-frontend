import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Stepper } from "../../components/ui/Stepper.jsx";
import { StepAccount } from "./steps/StepAccount.jsx";
import StepPersonal from "./steps/StepPersonal.jsx";
import { registerContestant, registerCoach } from "../../services/authService";
import { PENDING_VERIFY_STORAGE_KEY } from "../../constants/auth";
import "../../styles/pages/register.css";

function navigateAfterRegister(data, navigate) {
    const userId = data?.id ?? data?.userId ?? data?.user?.id;
    if (userId != null) {
        sessionStorage.setItem(PENDING_VERIFY_STORAGE_KEY, String(userId));
        navigate("/verify-account", { state: { userId } });
    } else {
        navigate("/verify-account");
    }
}

export const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [accountType, setAccountType] = useState("contestant");

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        username: "",
        password: "",
        email: "",
        birthDate: "",
        size: "",
        codeforcesHandle: "",
        gender: ""
    });

    const handleRegister = useCallback(async () => {
        setError("");
        setLoading(true);
        try {
            const registerFn =
                accountType === "coach" ? registerCoach : registerContestant;
            const data = await registerFn(formData);

            if (accountType === "coach") {
                navigate("/login", {
                    state: {
                        message: "Tu registro como coach ha sido enviado. Un administrador deberá aprobar tu cuenta antes de que puedas iniciar sesión. Revisa tu correo institucional: allí recibirás la confirmación cuando tu cuenta sea activada."
                    }
                });
            } else {
                navigateAfterRegister(data, navigate);
            }
        } catch (err) {
            setError(err.message || "No se pudo crear la cuenta. Verifica los datos.");
        } finally {
            setLoading(false);
        }
    }, [formData, navigate, accountType]);

    const selectContestant = useCallback(() => setAccountType("contestant"), []);
    const selectCoach = useCallback(() => setAccountType("coach"), []);

    const goToStep2 = useCallback(() => setStep(2), []);
    const goToLogin = useCallback(() => navigate("/login"), [navigate]);
    const goToStep1 = useCallback(() => setStep(1), []);

    const isCoach = accountType === "coach";

    return (
        <AuthLayout variant="wide">
            <div className="register-layout">
                <div className="register-visual">
                    <div className="register-visual-heading">
                        <h2>Thoth para tu equipo</h2>
                        <p>
                            Gestiona entrenamientos, seguimiento y resultados en una
                            sola plataforma pensada para programación competitiva.
                        </p>
                    </div>
                    <ul className="register-visual-list">
                        <li>Panel para competidores y coaches</li>
                        <li>Seguimiento de progreso y rankings</li>
                        <li>Integración con Codeforces</li>
                    </ul>
                </div>

                <div className="register-form-panel">
                    <div className="register-header">
                        <h1>Crear cuenta</h1>
                        <p>Paso {step} de 2 · {isCoach ? "Coach" : "Competidor"}</p>
                    </div>

                    <div
                        className="register-account-toggle"
                        role="tablist"
                        aria-label="Selecciona el tipo de cuenta"
                    >
                        <button
                            type="button"
                            className={
                                accountType === "contestant"
                                    ? "register-account-toggle__item is-active"
                                    : "register-account-toggle__item"
                            }
                            onClick={selectContestant}
                            role="tab"
                            aria-selected={accountType === "contestant"}
                        >
                            Competidor
                        </button>
                        <button
                            type="button"
                            className={
                                accountType === "coach"
                                    ? "register-account-toggle__item is-active"
                                    : "register-account-toggle__item"
                            }
                            onClick={selectCoach}
                            role="tab"
                            aria-selected={accountType === "coach"}
                        >
                            Coach
                        </button>
                    </div>

                    <Stepper currentStep={step} totalSteps={2} />

                    {error && <p className="auth-error">{error}</p>}

                    {step === 1 && (
                        <StepAccount
                            formData={formData}
                            setFormData={setFormData}
                            onNext={goToStep2}
                            onBack={goToLogin}
                        />
                    )}

                    {step === 2 && (
                        <StepPersonal
                            formData={formData}
                            setFormData={setFormData}
                            onBack={goToStep1}
                            onFinish={handleRegister}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </AuthLayout>
    );
};
