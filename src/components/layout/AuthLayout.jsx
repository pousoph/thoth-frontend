import '../../styles/pages/auth.css';

export const AuthLayout = ({ children }) => {
    return (
        <div className="auth-container">
            <div className="auth-card">
                {children}
            </div>
        </div>
    );
};
