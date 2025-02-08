import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// @desc    Route wrapper to protect authenticated routes and handle redirects
const ProtectedRoute = ({ children, allowGuest = false }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const location = useLocation();

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Redirect guests from restricted routes
    if (!allowGuest && user?.role === 'guest') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute; 