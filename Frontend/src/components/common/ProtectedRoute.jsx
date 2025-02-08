import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login page but save the attempted url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
} 