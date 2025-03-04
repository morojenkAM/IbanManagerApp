import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/auth';
import './Header.css';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Check user roles
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const isOperator = user?.roles?.includes('ROLE_OPERATOR');

    return (
        <header className="app-header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <Link to={isAdmin ? "/dashboard" : "/ibans"}>IBAN Management</Link>
                    </div>

                    <nav className="desktop-nav">
                        {isAdmin && (
                            <>
                                <Link to="/dashboard">Dashboard</Link>
                                <Link to="/users">Utilizatori</Link>
                            </>
                        )}
                        <Link to="/ibans">IBAN Registry</Link>
                        {(isAdmin || isOperator) && (
                            <Link to="/ibans/new">Adaugă IBAN</Link>
                        )}
                    </nav>

                    <button
                        className="mobile-menu-button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span>☰</span>
                    </button>

                    <div className="user-section">
                        {user && (
                            <>
                                <div className="user-info">
                                    <span>Conectat ca: <strong>{user.username}</strong></span>
                                    {user.raionCode && (
                                        <span className="raion-badge">Raion: {user.raionCode}</span>
                                    )}
                                </div>
                                <button className="logout-button" onClick={handleLogout}>
                                    Deconectare
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    <div className="container">
                        <nav className="mobile-nav">
                            {isAdmin && (
                                <>
                                    <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                                    <Link to="/users" onClick={() => setMenuOpen(false)}>Utilizatori</Link>
                                </>
                            )}
                            <Link to="/ibans" onClick={() => setMenuOpen(false)}>IBAN Registry</Link>
                            {(isAdmin || isOperator) && (
                                <Link to="/ibans/new" onClick={() => setMenuOpen(false)}>Adaugă IBAN</Link>
                            )}
                            <div className="mobile-user-section">
                                {user && (
                                    <>
                                        <div className="mobile-user-info">
                                            <span>Conectat ca: <strong>{user.username}</strong></span>
                                            {user.raionCode && (
                                                <span className="mobile-raion-badge">Raion: {user.raionCode}</span>
                                            )}
                                        </div>
                                        <button className="mobile-logout-button" onClick={handleLogout}>
                                            Deconectare
                                        </button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;