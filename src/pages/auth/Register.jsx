import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Stepper } from "../../components/ui/Stepper.jsx";
import { StepAccount } from "./steps/StepAccount.jsx";
import StepPersonal from "./steps/StepPersonal.jsx";
import { registerContestant } from "../../services/authService";
import "../../styles/pages/register.css";

export const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const handleRegister = async () => {
        setError("");
        setLoading(true);

        try {
            await registerContestant(formData);
            navigate("/verify-account");
        } catch (err) {
            setError("No se pudo crear la cuenta. Verifica los datos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="register-container">

                <div className="register-header">
                    <h1>Crear cuenta</h1>
                    <p>Paso {step} de 2</p>
                </div>

                <Stepper currentStep={step} totalSteps={2} />

                {error && <p className="auth-error">{error}</p>}

                {step === 1 && (
                    <StepAccount
                        formData={formData}
                        setFormData={setFormData}
                        onNext={() => setStep(2)}
                        onBack={() => navigate("/login")}
                    />
                )}

                {step === 2 && (
                    <StepPersonal
                        formData={formData}
                        setFormData={setFormData}
                        onBack={() => setStep(1)}
                        onFinish={handleRegister}
                        loading={loading}
                    />
                )}

            </div>
        </AuthLayout>
    );
};
