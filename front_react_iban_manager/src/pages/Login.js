import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import './Login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            if (user.roles.includes('ROLE_ADMIN')) {
                navigate('/dashboard');
            } else {
                navigate('/ibans');
            }
        }
    }, [isAuthenticated, navigate, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = await login(credentials);


            if (userData.roles.includes('ROLE_ADMIN')) {
                navigate('/dashboard');
            } else {
                navigate('/ibans');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Autentificare eșuată. Verificați numele de utilizator și parola.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <h1>IBAN Management System</h1>
                    <p>Vă rugăm să vă autentificați pentru a continua</p>
                </div>

                {error && (
                    <div className="login-error">
                        <p className="font-medium">Eroare</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label htmlFor="username">Nume utilizator</label>
                        <input
                            id="username"
                            className="login-input"
                            type="text"
                            name="username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="login-form-group">
                        <label htmlFor="password">Parolă</label>
                        <input
                            id="password"
                            className="login-input"
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="login-button-content">
                                <span className="login-spinner"></span>
                                Se procesează...
                            </span>
                        ) : 'Autentificare'}
                    </button>
                </form>

                <div className="login-credentials">
                    <h3>Credențiale test:</h3>
                    <div className="credential-items">
                        <div className="credential-item">
                            <div className="credential-role admin">Admin:</div>
                            <div className="credential-details">admin / admin123</div>
                        </div>
                        <div className="credential-item">
                            <div className="credential-role operator">Operator:</div>
                            <div className="credential-details">operator / operator123</div>
                        </div>
                        <div className="credential-item">
                            <div className="credential-role raion">Operator Raion:</div>
                            <div className="credential-details">raion / raion123</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;