import { useCallback, useMemo } from "react";
import { Button } from "../../../components/ui/Button";

const FIELDS = ["name", "lastName", "birthDate", "gender", "size", "codeforcesHandle"];

const isStepPersonalValid = (formData) =>
    FIELDS.every((field) => Boolean(formData[field]));

const StepPersonal = ({ formData, setFormData, onBack, onFinish, loading }) => {
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, [setFormData]);

    const isValid = useMemo(
        () => isStepPersonalValid(formData),
        [formData]
    );

    return (
        <div className="step fade-in">

            <div className="input-group">
                <label htmlFor="step-personal-name">Nombre</label>
                <input
                    id="step-personal-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label htmlFor="step-personal-lastName">Apellido</label>
                <input
                    id="step-personal-lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label htmlFor="step-personal-birthDate">Fecha de nacimiento</label>
                <input
                    id="step-personal-birthDate"
                    type="text"
                    name="birthDate"
                    placeholder="01-01-2000"
                    value={formData.birthDate}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label htmlFor="step-personal-gender">Género</label>
                <select
                    id="step-personal-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="">Seleccionar</option>
                    <option value="Male">Masculino</option>
                    <option value="Female">Femenino</option>
                </select>
            </div>

            <div className="input-group">
                <label htmlFor="step-personal-size">Talla de camiseta</label>
                <select
                    id="step-personal-size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                >
                    <option value="">Seleccionar</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                </select>
            </div>

            <div className="input-group">
                <label htmlFor="step-personal-codeforcesHandle">Codeforces handle</label>
                <input
                    id="step-personal-codeforcesHandle"
                    type="text"
                    name="codeforcesHandle"
                    value={formData.codeforcesHandle}
                    onChange={handleChange}
                />
            </div>

            <div className="step-actions">
                <Button variant="secondary" onClick={onBack}>
                    Atrás
                </Button>

                <Button
                    onClick={onFinish}
                    disabled={!isValid || loading}
                >
                    {loading ? "Creando..." : "Crear cuenta"}
                </Button>
            </div>

        </div>
    );
};

export default StepPersonal;
