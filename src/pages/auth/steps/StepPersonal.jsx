import { Button } from "../../../components/ui/Button";

const StepPersonal = ({ formData, setFormData, onBack, onFinish, loading }) => {

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const isValid =
        formData.name &&
        formData.lastName &&
        formData.birthDate &&
        formData.gender &&
        formData.size &&
        formData.codeforcesHandle;

    return (
        <div className="step fade-in">

            <div className="input-group">
                <label>Nombre</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label>Apellido</label>
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label>Fecha de nacimiento</label>
                <input
                    type="text"
                    name="birthDate"
                    placeholder="01-01-2000"
                    value={formData.birthDate}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label>Género</label>
                <select
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
                <label>Talla de camiseta</label>
                <select
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
                <label>Codeforces handle</label>
                <input
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
