import '../../styles/pages/auth.css';

export const AuthLayout = ({ children, variant = "default" }) => {
    const cardClassName =
        variant === "wide" ? "auth-card auth-card--wide" : "auth-card";

    return (
        <div className="auth-container">
            <div className={cardClassName}>
                {children}
            </div>
        </div>
    );
};
