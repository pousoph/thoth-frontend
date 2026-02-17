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

function buildAuthValue(user, actions) {
    const identity = user || {};
    return {
        user,
        isAuthenticated: Boolean(identity.token),
        role: identity.role || null,
        level: identity.level || null,
        name: identity.name || null,
        last_name: identity.last_name || null,
        token: identity.token || null,
        ...actions
    };
}

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

    const value = buildAuthValue(user, { saveUser, updateLevel, logout });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
