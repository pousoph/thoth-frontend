const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginUser = async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    if (!response.ok) {
        throw new Error("Credenciales incorrectas");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
};
/** Converts YYYY-MM-DD (date input) to DD-MM-YYYY (API). */
const toBirthDateApi = (value) => {
    if (!value) return value;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return value;
};

export const registerContestant = async (formData) => {
    const body = {
        name: formData.name,
        "last-name": formData.lastName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        "birth-date": toBirthDateApi(formData.birthDate),
        size: formData.size,
        "codeforces-handle": formData.codeforcesHandle,
        gender: formData.gender
    };

    const url = `${API_BASE_URL}/api/v1/auth/register/contestant`;


    const response = await fetch(
        url,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message =
            data.message || data.error || "Error al registrar usuario";
        throw new Error(message);
    }

    return data;
};

const getDirectMessage = (data) => data.message ?? data.error ?? data.detail;

const getErrorsFieldMessage = (data) => {
    const err = data.errors;
    if (Array.isArray(err)) return err.join(", ");
    return err != null ? String(err) : null;
};

/** Build user-friendly message from API error response. */
const getErrorMessage = (data, fallback) => {
    if (!data || typeof data !== "object") return fallback;
    const msg = getDirectMessage(data) ?? getErrorsFieldMessage(data);
    return msg != null ? String(msg) : fallback;
};

export const verifyAccount = async (code, id) => {
    const userId = id != null ? Number(id) : undefined;
    if (userId === undefined || Number.isNaN(userId)) {
        throw new Error("Falta el identificador de usuario. Vuelve a registrarte.");
    }
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/activate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, id: userId })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = getErrorMessage(
            data,
            "Código inválido o expirado."
        );
        throw new Error(message);
    }

    return data;
};
