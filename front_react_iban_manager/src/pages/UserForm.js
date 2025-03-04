import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './UserForm.css';

const UserForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        roles: [],
        raionCode: ''
    });


    const [raions, setRaions] = useState([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [success, setSuccess] = useState('');

    // Load initial data (raions and user data if editing)
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {

                const raionsResponse = await axios.get('/ibans/raions');
                setRaions(raionsResponse.data);


                if (isEditMode) {
                    const userResponse = await axios.get(`/users/${id}`);

                    const userData = userResponse.data;
                    setFormData({
                        username: userData.username,
                        password: '',
                        fullName: userData.fullName,
                        email: userData.email,
                        roles: Array.from(userData.roles),
                        raionCode: userData.raionCode || ''
                    });
                }
            } catch (err) {
                let errorMessage = 'Nu s-au putut încărca datele. Vă rugăm să încercați din nou.';

                if (err.response && err.response.data) {
                    if (err.response.data.message) {
                        errorMessage = err.response.data.message;
                    } else if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    }
                }

                setError(errorMessage);
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [isEditMode, id]);

    // Available roles
    const availableRoles = [
        { id: 'ROLE_ADMIN', name: 'Administrator' },
        { id: 'ROLE_OPERATOR', name: 'Operator' },
        { id: 'ROLE_OPERATOR_RAION', name: 'Operator Raion' }
    ];

    // Form validation
    const validateForm = () => {
        const errors = {};


        if (!formData.username) errors.username = 'Numele de utilizator este obligatoriu';
        if (!isEditMode && !formData.password) errors.password = 'Parola este obligatorie';
        if (!formData.fullName) errors.fullName = 'Numele complet este obligatoriu';
        if (!formData.email) errors.email = 'Adresa de email este obligatorie';
        if (formData.roles.length === 0) errors.roles = 'Cel puțin un rol trebuie selectat';


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            errors.email = 'Adresa de email nu este validă';
        }


        if (formData.username && formData.username.length < 3) {
            errors.username = 'Numele de utilizator trebuie să conțină cel puțin 3 caractere';
        }


        if (formData.password && formData.password.length < 6) {
            errors.password = 'Parola trebuie să conțină cel puțin 6 caractere';
        }


        if (formData.roles.includes('ROLE_OPERATOR_RAION') && (!formData.raionCode || formData.raionCode === '')) {
            errors.raionCode = 'Selectarea raionului este obligatorie pentru operatorii de raion';
        }

        return errors;
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });


        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: ''
            });
        }
    };

    // Handle role checkbox changes
    const handleRoleChange = (roleId) => {
        const newRoles = formData.roles.includes(roleId)
            ? formData.roles.filter(r => r !== roleId)
            : [...formData.roles, roleId];

        setFormData({
            ...formData,
            roles: newRoles
        });


        if (validationErrors.roles) {
            setValidationErrors({
                ...validationErrors,
                roles: ''
            });
        }
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();


        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');


        console.log("Datele care vor fi trimise:", formData);


        if (formData.roles.includes('ROLE_OPERATOR_RAION') && (!formData.raionCode || formData.raionCode === '')) {
            setValidationErrors({
                ...validationErrors,
                raionCode: 'Pentru rolul Operator Raion este obligatorie selectarea unui raion'
            });
            setSubmitting(false);
            return;
        }

        const submissionData = {
            username: formData.username,
            password: formData.password,
            fullName: formData.fullName,
            email: formData.email,
            roles: formData.roles,
            raionCode: formData.raionCode
        };

        console.log("Date finale trimise la server:", submissionData);

        try {
            if (isEditMode) {

                const response = await axios.put(`/users/${id}`, submissionData);
                console.log("Răspuns de la server (actualizare):", response.data);
                setSuccess('Utilizator actualizat cu succes!');

                setTimeout(() => navigate('/users'), 1500);
            } else {

                const response = await axios.post('/users', submissionData);
                console.log("Răspuns de la server (creare):", response.data);
                setSuccess('Utilizator creat cu succes!');


                setTimeout(() => navigate('/users'), 1500);
            }
        } catch (err) {
            console.error("Eroare completă:", err);

            let errorMessage = 'Nu s-a putut salva utilizatorul. Vă rugăm să încercați din nou.';

            if (err.response) {
                console.error("Status:", err.response.status);
                console.error("Headers:", err.response.headers);
                console.error("Data:", err.response.data);

                if (err.response.data) {
                    if (err.response.data.message) {
                        errorMessage = err.response.data.message;
                    } else if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    }
                }
            }

            setError(errorMessage);
            console.error('Error saving user:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <div className="user-form-container">
                <h1>{isEditMode ? 'Editare Utilizator' : 'Adăugare Utilizator Nou'}</h1>

                {loading && !submitting && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                )}

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

                <form onSubmit={handleSubmit} className="user-form">
                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username">
                            Nume utilizator <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={validationErrors.username ? 'error' : ''}
                            placeholder="Ex: john.doe"
                            disabled={submitting || (isEditMode && loading)}
                        />
                        {validationErrors.username && (
                            <p className="error-text">{validationErrors.username}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">
                            Parolă {!isEditMode && <span className="required">*</span>}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={validationErrors.password ? 'error' : ''}
                            placeholder={isEditMode ? "Lasă gol pentru a păstra parola actuală" : "Introdu o parolă"}
                            disabled={submitting}
                        />
                        {validationErrors.password && (
                            <p className="error-text">{validationErrors.password}</p>
                        )}
                        {isEditMode && (
                            <p className="hint-text">
                                Completați doar dacă doriți să schimbați parola.
                            </p>
                        )}
                    </div>

                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="fullName">
                            Nume complet <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={validationErrors.fullName ? 'error' : ''}
                            placeholder="Ex: John Doe"
                            disabled={submitting}
                        />
                        {validationErrors.fullName && (
                            <p className="error-text">{validationErrors.fullName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={validationErrors.email ? 'error' : ''}
                            placeholder="Ex: john.doe@example.com"
                            disabled={submitting}
                        />
                        {validationErrors.email && (
                            <p className="error-text">{validationErrors.email}</p>
                        )}
                    </div>

                    {/* Roles */}
                    <div className="form-group">
                        <label>
                            Roluri <span className="required">*</span>
                        </label>
                        <div className="roles-checkbox-group">
                            {availableRoles.map(role => (
                                <div key={role.id} className="role-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        checked={formData.roles.includes(role.id)}
                                        onChange={() => handleRoleChange(role.id)}
                                        disabled={submitting}
                                    />
                                    <label htmlFor={`role-${role.id}`}>
                                        {role.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {validationErrors.roles && (
                            <p className="error-text">{validationErrors.roles}</p>
                        )}
                    </div>

                    {/* Raion (only for ROLE_OPERATOR_RAION) */}
                    {formData.roles.includes('ROLE_OPERATOR_RAION') && (
                        <div className="form-group">
                            <label htmlFor="raionCode">
                                Raion <span className="required">*</span>
                            </label>
                            <select
                                id="raionCode"
                                name="raionCode"
                                value={formData.raionCode}
                                onChange={handleChange}
                                className={validationErrors.raionCode ? 'error' : ''}
                                disabled={submitting}
                            >
                                <option value="">Selectați raionul</option>
                                {raions.map(raion => (
                                    <option key={raion.code} value={raion.code}>
                                        {raion.name}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.raionCode && (
                                <p className="error-text">{validationErrors.raionCode}</p>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="add-user-btn"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="spinner-sm"></span>
                                    Se procesează...
                                </>
                            ) : (
                                isEditMode ? 'Salvează modificările' : (
                                    <>
                                        <span className="plus-icon">+</span> Adaugă Utilizator
                                    </>
                                )
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/users')}
                            className="cancel-button"
                            disabled={submitting}
                        >
                            Anulează
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;