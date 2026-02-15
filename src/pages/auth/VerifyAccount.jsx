import { useState } from "react";
import emailGif from "../../assets/imgs/emailSent.gif"
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import "../../styles/pages/verifyAccount.css";


const VerifyAccount = () => {
    const [code, setCode] = useState("");

    return (
        <AuthLayout>
            <div className="verify-container fade-in">

                <div className="verify-icon">
                    <img
                        src={emailGif}
                        alt="Correo enviado"
                        className="verify-gif"
                    />
                </div>

                <h1>Revisa tu correo</h1>

                <p className="verify-text">
                    Hemos enviado un código de verificación a tu correo electrónico.
                    Ingresa el código para activar tu cuenta.
                </p>

                <Input
                    label="Código de verificación"
                    placeholder="Ej. 123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />

                <Button onClick={() => console.log("Código:", code)}>
                    Verificar cuenta
                </Button>

                <p className="verify-helper">
                    ¿No recibiste el correo? Revisa spam o espera unos minutos.
                </p>

            </div>
        </AuthLayout>
    );
};

export default VerifyAccount;
