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
export const registerContestant = async (formData) => {

    const body = {
        name: formData.name,
        "last-name": formData.lastName,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        "birth-date": formData.birthDate,
        size: formData.size,
        "codeforces-handle": formData.codeforcesHandle,
        gender: formData.gender
    };

    const response = await fetch(
        `${API_BASE_URL}/api/v1/auth/register/contestant`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
    );

    if (!response.ok) {
        throw new Error("Error al registrar usuario");
    }

    return response.json();
};
