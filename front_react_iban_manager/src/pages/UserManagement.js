import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get('/users');
            setUsers(response.data);
        } catch (err) {
            setError('Nu s-au putut încărca utilizatorii. Vă rugăm să încercați din nou.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle user deletion
    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Sigur doriți să ștergeți utilizatorul ${username}?`)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.delete(`/users/${userId}`);
            setSuccess(`Utilizatorul ${username} a fost șters cu succes`);
            fetchUsers(); // Refresh the list
        } catch (err) {
            setError('Nu s-a putut șterge utilizatorul.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Format role name for display
    const formatRoleName = (role) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return 'Administrator';
            case 'ROLE_OPERATOR':
                return 'Operator';
            case 'ROLE_OPERATOR_RAION':
                return 'Operator Raion';
            default:
                return role;
        }
    };

    return (
        <div className="container">
            <div className="header-container">
                <h1>Administrare Utilizatori</h1>

                <div className="action-buttons">
                    <Link
                        to="/users/new"
                        className="add-user-btn"
                    >
                        <span className="plus-icon">+</span> Adaugă Utilizator Nou
                    </Link>
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="error-message">
                    <p><strong>Eroare</strong></p>
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="success-message">
                    <p><strong>Succes</strong></p>
                    <p>{success}</p>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            )}

            {/* Users Table */}
            <div className="table-container">
                <table className="users-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>UTILIZATOR</th>
                        <th>NUME COMPLET</th>
                        <th>EMAIL</th>
                        <th>ROLURI</th>
                        <th>RAION</th>
                        <th>ACȚIUNI</th>
                    </tr>
                    </thead>
                    <tbody>
                    {!loading && users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td className="username-cell">{user.username}</td>
                                <td>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="roles-container">
                                        {user.roles.map(role => (
                                            <span
                                                key={role}
                                                className={`role-badge ${
                                                    role === 'ROLE_ADMIN'
                                                        ? 'admin'
                                                        : role === 'ROLE_OPERATOR'
                                                            ? 'operator'
                                                            : 'raion'
                                                }`}
                                            >
                                                    {formatRoleName(role)}
                                                </span>
                                        ))}
                                    </div>
                                </td>
                                <td>{user.raionName || '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <Link
                                            to={`/users/edit/${user.id}`}
                                            className="edit-button"
                                        >
                                            <span className="edit-icon">✎</span> Editare
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            className="delete-button"
                                        >
                                            <span className="delete-icon">🗑</span> Ștergere
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="empty-message">
                                {loading ? 'Se încarcă...' : 'Nu există utilizatori.'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;