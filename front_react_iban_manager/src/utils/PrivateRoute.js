import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import Layout from './Layout';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, loading, hasRole } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Se încarcă...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check role requirements
    if (roles.length > 0 && !hasRole(roles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Render the protected component
    return <Layout>{children}</Layout>;
};

export default PrivateRoute;