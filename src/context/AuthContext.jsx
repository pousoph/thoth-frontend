import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }
    return ctx;
};

const TOKEN_KEY = "thoth_token";

function getInitialUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const stored = localStorage.getItem("thoth_user");
    if (!stored) return { token };
    try {
        return { ...JSON.parse(stored), token };
    } catch {
        return { token };
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser);

    const saveUser = useCallback((data) => {
        const { token, role, name, last_name, level } = data;
        if (token) localStorage.setItem(TOKEN_KEY, token);
        const userData = { token, role, name, last_name };
        if (level != null) userData.level = level;
        setUser(userData);
        localStorage.setItem("thoth_user", JSON.stringify(userData));
    }, []);

    const updateLevel = useCallback((level) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, level };
            localStorage.setItem("thoth_user", JSON.stringify(next));
            return next;
        });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("thoth_user");
        setUser(null);
    }, []);

    const value = {
        user,
        isAuthenticated: Boolean(user?.token),
        role: user?.role ?? null,
        level: user?.level ?? null,
        name: user?.name ?? null,
        last_name: user?.last_name ?? null,
        token: user?.token ?? null,
        saveUser,
        updateLevel,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
