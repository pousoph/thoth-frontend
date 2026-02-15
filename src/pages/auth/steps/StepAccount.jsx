import { useCallback } from "react";
import { Input } from "../../../components/ui/Input.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export const StepAccount = ({ formData, setFormData, onNext, onBack }) => {
    const handleEmailChange = useCallback((e) => {
        setFormData((prev) => ({ ...prev, email: e.target.value }));
    }, [setFormData]);

    const handleUsernameChange = useCallback((e) => {
        setFormData((prev) => ({ ...prev, username: e.target.value }));
    }, [setFormData]);

    const handlePasswordChange = useCallback((e) => {
        setFormData((prev) => ({ ...prev, password: e.target.value }));
    }, [setFormData]);

    const isValid =
        formData.email &&
        formData.username &&
        formData.password;

    return (
        <div className="step fade-in">

            <Input
                label="Correo institucional"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
            />

            <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={handleUsernameChange}
            />

            <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
            />

            <div className="step-actions">
                <Button variant="secondary" onClick={onBack}>
                    Atrás
                </Button>

                <Button
                    onClick={onNext}
                    disabled={!isValid}
                >
                    Continuar
                </Button>
            </div>

        </div>
    );
};
