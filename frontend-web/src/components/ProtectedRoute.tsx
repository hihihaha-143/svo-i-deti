import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRole }: { allowedRole?: string }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={`/${user.role}`} replace />;
    }

    return <Outlet />;
}