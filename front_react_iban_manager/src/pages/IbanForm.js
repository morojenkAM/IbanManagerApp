import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './IbanForm.css';

const IbanForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        ibanCode: '',
        year: new Date().getFullYear(),
        ecoCode: '',
        raionCode: '',
        localityCode: ''
    });


    const [years, setYears] = useState([]);
    const [ecoCodes, setEcoCodes] = useState([]);
    const [raions, setRaions] = useState([]);
    const [localities, setLocalities] = useState([]);


    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [success, setSuccess] = useState('');

    // Generate years array (current year and 4 previous years)
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const yearsArray = Array.from({ length: 5 }, (_, i) => currentYear - i);
        setYears(yearsArray);
    }, []);

    // Fetch necessary data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ecoResponse, raionResponse] = await Promise.all([
                    axios.get('/ibans/eco-codes'),
                    axios.get('/ibans/raions')
                ]);

                setEcoCodes(ecoResponse.data);
                setRaions(raionResponse.data);

                // If in edit mode, fetch IBAN data
                if (isEditMode) {
                    const ibanResponse = await axios.get(`/ibans/${id}`);
                    const ibanData = ibanResponse.data;
                    setFormData({
                        ibanCode: ibanData.ibanCode,
                        year: ibanData.year,
                        ecoCode: ibanData.ecoCode,
                        raionCode: ibanData.raionCode,
                        localityCode: ibanData.localityCode
                    });

                    // If raion is selected, load localities
                    if (ibanData.raionCode) {
                        const localityResponse = await axios.get(`/ibans/localities/${ibanData.raionCode}`);
                        setLocalities(localityResponse.data);
                    }
                }
            } catch (err) {
                setError('Nu s-au putut încărca datele. Vă rugăm să încercați din nou.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode]);

    // Load localities when raion changes
    useEffect(() => {
        const fetchLocalities = async () => {
            if (!formData.raionCode) {
                setLocalities([]);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.get(`/ibans/localities/${formData.raionCode}`);
                setLocalities(response.data);
            } catch (err) {
                console.error('Error loading localities:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLocalities();
    }, [formData.raionCode]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // For IBAN code, convert to uppercase
        if (name === 'ibanCode') {
            setFormData({
                ...formData,
                [name]: value.toUpperCase()
            });
        } else if (name === 'raionCode') {
            // Reset locality when raion changes
            setFormData({
                ...formData,
                [name]: value,
                localityCode: ''
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Clear validation errors for this field
        if (validationErrors[name]) {
            setValidationErrors({
                ...validationErrors,
                [name]: null
            });
        }
    };

    // Validate IBAN code
    const validateIbanCode = (ibanCode) => {
        const errors = [];

        // Check length
        if (ibanCode.length !== 24) {
            errors.push('Codul IBAN trebuie să conțină exact 24 de caractere.');
        }

        // Check if starts with MD
        if (!ibanCode.startsWith('MD')) {
            errors.push('Codul IBAN trebuie să înceapă cu "MD".');
        }

        // Check if last 14 characters are digits
        const last14Chars = ibanCode.slice(-14);
        if (!/^\d+$/.test(last14Chars)) {
            errors.push('Ultimele 14 caractere trebuie să fie numere.');
        }

        // Check for uppercase letters
        if (ibanCode !== ibanCode.toUpperCase()) {
            errors.push('Toate literele trebuie să fie majuscule.');
        }

        return errors;
    };

    // Validate form before submission
    const validateForm = () => {
        const errors = {};

        // Validate IBAN code
        if (!formData.ibanCode) {
            errors.ibanCode = ['Codul IBAN este obligatoriu.'];
        } else {
            const ibanErrors = validateIbanCode(formData.ibanCode);
            if (ibanErrors.length > 0) {
                errors.ibanCode = ibanErrors;
            }
        }

        // Validate other required fields
        if (!formData.ecoCode) {
            errors.ecoCode = ['Codul Eco este obligatoriu.'];
        }

        if (!formData.raionCode) {
            errors.raionCode = ['Raionul este obligatoriu.'];
        }

        if (!formData.localityCode) {
            errors.localityCode = ['Localitatea este obligatorie.'];
        }

        return errors;
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (isEditMode) {

                await axios.put(`/ibans/${id}`, formData);
                setSuccess('IBAN actualizat cu succes!');


                setTimeout(() => navigate('/ibans'), 1500);
            } else {

                await axios.post('/ibans', formData);
                setSuccess('IBAN adăugat cu succes!');


                setTimeout(() => navigate('/ibans'), 1500);
            }
        } catch (err) {
            console.error('Error saving IBAN:', err);
            setError(
                err.response?.data?.message ||
                'A apărut o eroare. Vă rugăm să încercați din nou.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <div className="iban-form-container">
                <h1>{isEditMode ? 'Editare IBAN' : 'Adăugare IBAN Nou'}</h1>

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

                <form onSubmit={handleSubmit} className="iban-form">
                    {/* IBAN Code field */}
                    <div className="form-group">
                        <label htmlFor="ibanCode">
                            Cod IBAN <span className="required">*</span>
                        </label>
                        <input
                            id="ibanCode"
                            name="ibanCode"
                            type="text"
                            value={formData.ibanCode}
                            onChange={handleChange}
                            maxLength="24"
                            className={validationErrors.ibanCode ? 'error' : ''}
                            placeholder="MD12AGRN0000123456789012"
                            disabled={submitting}
                        />
                        {validationErrors.ibanCode && (
                            <div className="error-list">
                                {validationErrors.ibanCode.map((err, index) => (
                                    <p key={index} className="error-text">{err}</p>
                                ))}
                            </div>
                        )}
                        <p className="hint-text">
                            IBAN-ul trebuie să aibă 24 de caractere, să înceapă cu MD și ultimele 14 caractere să fie cifre.
                        </p>
                    </div>

                    {/* Year selection */}
                    <div className="form-group">
                        <label htmlFor="year">
                            Anul <span className="required">*</span>
                        </label>
                        <select
                            id="year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            disabled={submitting}
                        >
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Eco code selection */}
                    <div className="form-group">
                        <label htmlFor="ecoCode">
                            Codul Eco <span className="required">*</span>
                        </label>
                        <select
                            id="ecoCode"
                            name="ecoCode"
                            value={formData.ecoCode}
                            onChange={handleChange}
                            className={validationErrors.ecoCode ? 'error' : ''}
                            disabled={submitting}
                        >
                            <option value="">Selectați codul Eco</option>
                            {ecoCodes.map(eco => (
                                <option key={eco.code} value={eco.code}>
                                    {eco.code} - {eco.label}
                                </option>
                            ))}
                        </select>
                        {validationErrors.ecoCode && (
                            <p className="error-text">{validationErrors.ecoCode[0]}</p>
                        )}
                    </div>

                    {/* Raion selection */}
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
                                    {raion.code} - {raion.name}
                                </option>
                            ))}
                        </select>
                        {validationErrors.raionCode && (
                            <p className="error-text">{validationErrors.raionCode[0]}</p>
                        )}
                    </div>

                    {/* Locality selection */}
                    <div className="form-group">
                        <label htmlFor="localityCode">
                            Localitate <span className="required">*</span>
                        </label>
                        <select
                            id="localityCode"
                            name="localityCode"
                            value={formData.localityCode}
                            onChange={handleChange}
                            className={validationErrors.localityCode ? 'error' : ''}
                            disabled={submitting || !formData.raionCode}
                        >
                            <option value="">
                                {formData.raionCode ? 'Selectați localitatea' : 'Selectați mai întâi un raion'}
                            </option>
                            {localities.map(locality => (
                                <option key={locality.code} value={locality.code}>
                                    {locality.code} - {locality.name}
                                </option>
                            ))}
                        </select>
                        {validationErrors.localityCode && (
                            <p className="error-text">{validationErrors.localityCode[0]}</p>
                        )}
                    </div>

                    {/* Form actions */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="add-iban-btn"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading-spinner-sm"></span>
                                    Se procesează...
                                </>
                            ) : (
                                isEditMode ? 'Salvează modificările' : (
                                    <>
                                        <span className="plus-icon">+</span> Adaugă IBAN
                                    </>
                                )
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/ibans')}
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

export default IbanForm;