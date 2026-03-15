export { default as LoginPage }          from './pages/LoginPage';
export { default as RegisterPage }       from './pages/RegisterPage';
export { default as VerifyAccountPage }  from './pages/VerifyAccountPage';
export { default as ForgotPasswordPage } from './pages/ForgotPasswordPage';
export { login, registerContestant, registerCoach, activateAccount, logout } from './services/authService';
export { default as useAuth } from './hooks/useAuth';
