const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const pingBackend = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/ping`);

        if (!response.ok) {
            throw new Error("Ping failed");
        }

        return true;
    } catch (error) {
        console.error("Error haciendo ping al backend:", error);
        return false;
    }
};
