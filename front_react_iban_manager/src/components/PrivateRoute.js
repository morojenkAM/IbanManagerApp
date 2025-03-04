import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import Header from './Header';

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, hasRole } = useAuth();


    if (!user) {
        return <Navigate to="/login" replace />;
    }


    if (roles.length > 0 && !hasRole(roles)) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
};

export default PrivateRoute;