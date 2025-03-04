import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './IbanList.css';

const IbanList = () => {
    const [ibans, setIbans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);


    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Get user from localStorage
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Fetch IBANs
    const fetchIbans = async (filterParams = {}) => {
        setLoading(true);
        setError('');

        try {

            const queryParams = new URLSearchParams();
            Object.entries(filterParams).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });


            let endpoint = '/ibans/filter';


            if (user?.roles?.includes('ROLE_OPERATOR_RAION') && user?.raionCode) {
                endpoint = `/ibans/raion/${user.raionCode}`;
                if (filterParams.year) {
                    queryParams.append('year', filterParams.year);
                }
            }

            const response = await axios.get(`${endpoint}?${queryParams}`);

            setIbans(response.data);
            setCurrentPage(1);
        } catch (err) {
            console.error('Error fetching IBAN data:', err);
            setError('Nu s-au putut încărca datele. Verificați conexiunea și reîncercați.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (user) {
            fetchIbans();
        }
    }, [user]);

    // Handle delete IBAN
    const handleDeleteIban = async (id) => {
        if (!window.confirm('Sigur doriți să ștergeți acest IBAN?')) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(`/ibans/${id}`);


            fetchIbans();
        } catch (err) {
            console.error('Error deleting IBAN:', err);
            setError('Nu s-a putut șterge IBAN-ul.');
        } finally {
            setLoading(false);
        }
    };

    // Export to CSV
    const handleExportCsv = async () => {
        try {
            const response = await axios.get('/ibans/export', {
                responseType: 'blob'
            });


            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `iban_registru_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Error exporting CSV:', err);
            setError('Nu s-a putut genera fișierul CSV');
        }
    };

    // Check if user can perform admin actions
    const canEdit = user && (user.roles?.includes('ROLE_ADMIN') || user.roles?.includes('ROLE_OPERATOR'));

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentIbans = ibans.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(ibans.length / itemsPerPage);

    // Function to change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Search component
    const IbanSearch = () => {
        const [filters, setFilters] = useState({
            year: new Date().getFullYear(),
            ecoCode: '',
            raionCode: '',
            localityCode: ''
        });
        const [ecoCodes, setEcoCodes] = useState([]);
        const [raions, setRaions] = useState([]);
        const [localities, setLocalities] = useState([]);
        const [searchLoading, setSearchLoading] = useState(false);

        // Load filter options
        useEffect(() => {
            const fetchFilterOptions = async () => {
                setSearchLoading(true);
                try {
                    const [ecoResponse, raionResponse] = await Promise.all([
                        axios.get('/ibans/eco-codes'),
                        axios.get('/ibans/raions')
                    ]);

                    setEcoCodes(ecoResponse.data);
                    setRaions(raionResponse.data);
                } catch (err) {
                    console.error('Error loading filter options:', err);
                } finally {
                    setSearchLoading(false);
                }
            };

            fetchFilterOptions();
        }, []);

        // Load localities when raion changes
        useEffect(() => {
            if (!filters.raionCode) {
                setLocalities([]);
                return;
            }

            const fetchLocalities = async () => {
                setSearchLoading(true);
                try {
                    const response = await axios.get(`/ibans/localities/${filters.raionCode}`);
                    setLocalities(response.data);
                } catch (err) {
                    console.error('Error loading localities:', err);
                } finally {
                    setSearchLoading(false);
                }
            };

            fetchLocalities();
        }, [filters.raionCode]);

        // Handle input changes
        const handleFilterChange = (e) => {
            const { name, value } = e.target;

            if (name === 'raionCode') {
                setFilters(prev => ({
                    ...prev,
                    [name]: value,
                    localityCode: '' // Reset locality when raion changes
                }));
            } else {
                setFilters(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        };

        // Handle search submission
        const handleSearch = () => {
            fetchIbans(filters);
        };

        return (
            <div>
                <h2>Filtrare IBAN-uri</h2>
                <div className="search-grid">
                    <div>
                        <label>Anul</label>
                        <select
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            disabled={searchLoading}
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                    <option key={year} value={year}>{year}</option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label>Codul Eco</label>
                        <select
                            name="ecoCode"
                            value={filters.ecoCode}
                            onChange={handleFilterChange}
                            disabled={searchLoading}
                        >
                            <option value="">Toate codurile Eco</option>
                            {ecoCodes.map(eco => (
                                <option key={eco.code} value={eco.code}>
                                    {eco.code} - {eco.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Raion</label>
                        <select
                            name="raionCode"
                            value={filters.raionCode}
                            onChange={handleFilterChange}
                            disabled={searchLoading || (user?.roles?.includes('ROLE_OPERATOR_RAION') && user?.raionCode)}
                        >
                            <option value="">Toate raioanele</option>
                            {raions.map(raion => (
                                <option key={raion.code} value={raion.code}>
                                    {raion.code} - {raion.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Localitate</label>
                        <select
                            name="localityCode"
                            value={filters.localityCode}
                            onChange={handleFilterChange}
                            disabled={searchLoading || !filters.raionCode}
                        >
                            <option value="">Toate localitățile</option>
                            {localities.map(locality => (
                                <option key={locality.code} value={locality.code}>
                                    {locality.code} - {locality.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="search-button-container">
                    <button
                        onClick={handleSearch}
                        className="cauta-button"
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Se încarcă...' : 'Caută'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container">
            <div className="header-container">
                <h1>Registru IBAN</h1>

                <div className="action-buttons">
                    {canEdit && (
                        <Link
                            to="/ibans/new"
                            className="add-iban-btn"
                        >
                            <span className="plus-icon">+</span> Adaugă IBAN Nou
                        </Link>
                    )}

                    <button
                        onClick={handleExportCsv}
                        className="export-csv-btn"
                    >
                        <span className="download-icon">↓</span> Export CSV
                    </button>
                </div>
            </div>

            <div className="filter-container">
                {/* Search Component */}
                <IbanSearch />
            </div>

            {/* Error message */}
            {error && (
                <div className="error-message">
                    <p><strong>Eroare</strong></p>
                    <p>{error}</p>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            )}

            {/* IBAN Table */}
            <div className="table-container">
                <table className="iban-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>COD IBAN</th>
                        <th>AN</th>
                        <th>COD ECO</th>
                        <th>LOCALITATE</th>
                        <th>RAION</th>
                        {canEdit && <th>ACȚIUNI</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {!loading && currentIbans.length > 0 ? (
                        currentIbans.map((iban) => (
                            <tr key={iban.id}>
                                <td>{iban.id}</td>
                                <td className="iban-code-cell">{iban.ibanCode}</td>
                                <td>{iban.year}</td>
                                <td>
                                    <div className="eco-code">
                                        {iban.ecoCode}
                                        <div className="eco-label">{iban.ecoLabel}</div>
                                    </div>
                                </td>
                                <td>{iban.localityName}</td>
                                <td>{iban.raionName}</td>
                                {canEdit && (
                                    <td>
                                        <div className="action-buttons">
                                            <Link
                                                to={`/ibans/edit/${iban.id}`}
                                                className="edit-button"
                                            >
                                                <span className="edit-icon">✎</span> Editare
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteIban(iban.id)}
                                                className="delete-button"
                                            >
                                                <span className="delete-icon">🗑</span> Ștergere
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={canEdit ? 7 : 6} className="empty-message">
                                {loading ? 'Se încarcă...' : 'Nu au fost găsite înregistrări.'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {ibans.length > itemsPerPage && (
                <div className="pagination">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                    >
                        &lt;
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Display a window of pages around the current page
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => paginate(pageNum)}
                                className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
};

export default IbanList;