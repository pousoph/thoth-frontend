import { useCallback, useMemo } from "react";
import { Button } from "../../../components/ui/Button";

const FIELDS = ["name", "lastName", "birthDate", "gender", "size", "codeforcesHandle"];

const isStepPersonalValid = (formData) =>
    FIELDS.every((field) => Boolean(formData[field]));

const currentDate = new Date();
const maxBirthDate = new Date(currentDate.getFullYear() - 10, 11, 31);
const minBirthDate = new Date(currentDate.getFullYear() - 100, 0, 1);

const formatForDateInput = (date) => date.toISOString().slice(0, 10);

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
        <div className="step step-personal fade-in">
            <p className="step-hint">Completa tus datos personales. Todos los campos son obligatorios.</p>

            <div className="step-fields step-fields--row">
                <div className="input-group">
                    <label htmlFor="step-personal-name">Nombre</label>
                    <input
                        id="step-personal-name"
                        type="text"
                        name="name"
                        placeholder="Ej. María"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="given-name"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="step-personal-lastName">Apellido</label>
                    <input
                        id="step-personal-lastName"
                        type="text"
                        name="lastName"
                        placeholder="Ej. García"
                        value={formData.lastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                    />
                </div>
            </div>

            <div className="input-group input-group--date">
                <label htmlFor="step-personal-birthDate">Fecha de nacimiento</label>
                <input
                    id="step-personal-birthDate"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    min={formatForDateInput(minBirthDate)}
                    max={formatForDateInput(maxBirthDate)}
                    title="Selecciona tu fecha de nacimiento"
                    aria-describedby="birthdate-hint"
                />
                <span id="birthdate-hint" className="input-hint">Haz clic en el campo para abrir el calendario</span>
            </div>

            <div className="step-fields step-fields--row">
                <div className="input-group">
                    <label htmlFor="step-personal-gender">Género</label>
                    <select
                        id="step-personal-gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        aria-label="Selecciona tu género"
                    >
                        <option value="">Selecciona tu género</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="step-personal-size">Talla de camiseta</label>
                    <select
                        id="step-personal-size"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        aria-label="Selecciona tu talla"
                    >
                        <option value="">Talla</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                    </select>
                </div>
            </div>

            <div className="input-group">
                <label htmlFor="step-personal-codeforcesHandle">Usuario de Codeforces</label>
                <input
                    id="step-personal-codeforcesHandle"
                    type="text"
                    name="codeforcesHandle"
                    placeholder="Ej. tu_usuario"
                    value={formData.codeforcesHandle}
                    onChange={handleChange}
                    autoComplete="username"
                />
                <span className="input-hint">El mismo que usas en codeforces.com</span>
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
