import { useEffect, useState } from "react";
import { pingBackend } from "./services/systemService";
import "./styles/systemAlert.css";
import {AppRouter} from "./routes/AppRouter.jsx";

function App() {
    const [backendStatus, setBackendStatus] = useState("checking");

    useEffect(() => {
        const checkBackend = async () => {
            const isAlive = await pingBackend();
            setBackendStatus(isAlive ? "ok" : "error");
        };

        checkBackend();
    }, []);

    if (backendStatus === "error") {
        return (
            <div className="system-error">
                <h2> Error de conexión</h2>
                <p>No se pudo conectar con el servidor.</p>
                <p>Intenta más tarde o contacta soporte.</p>
            </div>
        );
    }

    return (
        <AppRouter/>
    );
}

export default App;
