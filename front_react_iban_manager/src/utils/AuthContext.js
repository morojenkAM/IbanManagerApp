import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from './axiosConfig'; // Make sure to use your configured axios instance

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            console.log('Logging in with:', credentials);
            const response = await axios.post('/auth/login', credentials);
            console.log('Login response:', response.data);

            const userData = response.data;

            // Store in localStorage
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update state
            setUser(userData);

            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    // Check if user has required role(s)
    const hasRole = (requiredRoles) => {
        if (!user || !user.roles) return false;

        if (Array.isArray(requiredRoles)) {
            return requiredRoles.some(role => user.roles.includes(role));
        }
        return user.roles.includes(requiredRoles);
    };

    const contextValue = {
        user,
        login,
        logout,
        hasRole,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};