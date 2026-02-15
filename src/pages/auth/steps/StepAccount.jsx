import { Input } from "../../../components/ui/Input.jsx";
import { Button } from "../../../components/ui/Button.jsx";

export const StepAccount = ({ formData, setFormData, onNext, onBack }) => {

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
                onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                }
            />

            <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                }
            />

            <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                }
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
