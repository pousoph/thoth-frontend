import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/auth/Login.jsx";
import { Register } from "../pages/auth/Register.jsx";
import VerifyAccount from "../pages/auth/VerifyAccount.jsx";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-account" element={<VerifyAccount />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />

            </Routes>
        </BrowserRouter>
    );
};
