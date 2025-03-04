import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';

const Unauthorized = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-red-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Access Denied
                </h2>

                <p className="text-gray-600 mb-6">
                    You don't have permission to access this page.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={goBack}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>

                    {user && (
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">
                                You are currently logged in as <span className="font-medium">{user.username}</span> with roles:{' '}
                                {user.roles.map((role, index) => (
                                    <span key={role} className="font-medium">
                                        {role.replace('ROLE_', '')}
                                        {index < user.roles.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>

                            <div className="flex justify-center space-x-4 mt-4">
                                {user.roles.includes('ROLE_ADMIN') ? (
                                    <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <Link to="/ibans" className="text-blue-600 hover:text-blue-800">
                                        Go to IBAN Registry
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;