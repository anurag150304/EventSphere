import { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from '../services/api';
import { loginSuccess, logout } from '../store/slices/authSlice';

const UserContext = createContext(null);

// @desc    Context provider for managing user authentication state
export const UserProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { user } = await authAPI.getProfile();
                    dispatch(loginSuccess({ user, token }));
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    dispatch(logout());
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [dispatch]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        dispatch(logout());
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        logout: handleLogout
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// @desc    Custom hook for accessing user context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === null) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default UserContext; 