export const SharedTest = () => console.log("Shared library is working!");
export const ARTECO_TEAL = '#246A73';
export { default as ArtecoShell } from './components/ArtecoShell';

// --- NEW AUTH ADDITIONS ---

// Components
export { LoginModal } from './components/LoginModal';

// Context
export { AuthProvider, useAuth } from './context/AuthContext';

// Services
export { default as api } from './services/api';