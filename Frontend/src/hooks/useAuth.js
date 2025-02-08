// @desc    Custom hook for authentication state management
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    // @desc    Handle user logout
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return {
        user,
        isAuthenticated,
        loading,
        logout: handleLogout
    };
}; 