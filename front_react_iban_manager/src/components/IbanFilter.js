import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const IbanFilter = () => {
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        ecoCode: '',
        raionCode: '',
        localityCode: ''
    });

    const [ecoCodes, setEcoCodes] = useState([]);
    const [raions, setRaions] = useState([]);
    const [localities, setLocalities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ibanResult, setIbanResult] = useState(null);

    // Fetch initial filter data
    useEffect(() => {
        const fetchFilterData = async () => {
            setLoading(true);
            setError('');

            try {
                const [ecoResponse, raionResponse] = await Promise.all([
                    axios.get('/ibans/eco-codes'),
                    axios.get('/ibans/raions')
                ]);

                setEcoCodes(ecoResponse.data);
                setRaions(raionResponse.data);
            } catch (err) {
                console.error('Error loading filter data:', err);
                setError('Nu s-au putut încărca datele pentru filtrare');
            } finally {
                setLoading(false);
            }
        };

        fetchFilterData();
    }, []);

    // Load localities when raion changes
    useEffect(() => {
        if (!filters.raionCode) {
            setLocalities([]);
            return;
        }

        const fetchLocalities = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/ibans/localities/${filters.raionCode}`);
                setLocalities(response.data);
            } catch (err) {
                console.error('Error loading localities:', err);
                setError('Nu s-au putut încărca localitățile');
            } finally {
                setLoading(false);
            }
        };

        fetchLocalities();
    }, [filters.raionCode]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Reset dependent fields when specific fields change
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

    // Handle export
    const handleExport = async () => {
        try {
            const response = await axios.get('/ibans/export', {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `registru_ibans_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error exporting CSV:', err);
            setError('Nu s-a putut exporta registrul');
        }
    };

    // Handle search
    const handleSearch = async () => {
        setLoading(true);
        setError('');

        try {
            // Build query parameters
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            // Perform search
            const response = await axios.get(`/ibans/filter?${params}`);
            setIbanResult(response.data);
        } catch (err) {
            console.error('Error searching IBAN:', err);
            setError('Nu s-a putut efectua căutarea');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            {/* Year Dropdown */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Anul:</label>
                <select
                    name="year"
                    value={filters.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {[...Array(5)].map((_, i) => {
                        const yearOption = new Date().getFullYear() - i;
                        return (
                            <option key={yearOption} value={yearOption}>
                                {yearOption}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Eco Code Dropdown */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Codul Eco:</label>
                <select
                    name="ecoCode"
                    value={filters.ecoCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Selectează Codul Eco</option>
                    {ecoCodes.map(eco => (
                        <option key={eco.code} value={eco.code}>
                            {eco.code} - {eco.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Raion Dropdown */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Raionul:</label>
                <select
                    name="raionCode"
                    value={filters.raionCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Selectează Raionul</option>
                    {raions.map(raion => (
                        <option key={raion.code} value={raion.code}>
                            {raion.code} - {raion.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Locality Dropdown */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Localitatea:</label>
                <select
                    name="localityCode"
                    value={filters.localityCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!filters.raionCode}
                >
                    <option value="">Selectează Localitatea</option>
                    {localities.map(locality => (
                        <option key={locality.code} value={locality.code}>
                            {locality.code} - {locality.name}
                        </option>
                    ))}
                </select>
                {!filters.raionCode && (
                    <p className="text-xs text-gray-500 mt-1">
                        Selectați mai întâi un raion
                    </p>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Se procesează...' : 'Afișează codul IBAN'}
                </button>

                <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded flex items-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    disabled={loading}
                >
                    <span>Descarcă registru</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default IbanFilter