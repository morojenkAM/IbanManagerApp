import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    // Fetch initial data for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [ecoResponse, raionResponse] = await Promise.all([
                    axios.get('/api/ibans/eco-codes', { headers }),
                    axios.get('/api/ibans/raions', { headers })
                ]);

                setEcoCodes(ecoResponse.data);
                setRaions(raionResponse.data);
            } catch (err) {
                setError('Nu s-au putut încărca datele pentru filtrare');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const response = await axios.get(`/api/ibans/localities/${filters.raionCode}`, { headers });
                setLocalities(response.data);
            } catch (err) {
                setError('Nu s-au putut încărca localitățile');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLocalities();
    }, [filters.raionCode]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'raionCode') {
            // Reset locality when raion changes
            setFilters(prev => ({
                ...prev,
                [name]: value,
                localityCode: ''
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle search
    const handleSearch = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await axios.get(`/api/ibans/filter?${params}`, { headers });
            setResult(response.data);
        } catch (err) {
            setError('Nu s-a putut efectua căutarea');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle export
    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/ibans/export', {
                headers: { 'Authorization': `Bearer ${token}` },
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
            setError('Nu s-a putut exporta registrul');
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
            <div className="grid grid-cols-1 gap-6">
                {/* Year Row */}
                <div className="flex items-center border-b pb-4">
                    <label className="text-gray-700 font-medium w-28 mr-2">Anul:</label>
                    <div className="relative flex-1">
                        <select
                            name="year"
                            value={filters.year}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            disabled={loading}
                        >
                            {[...Array(5)].map((_, i) => {
                                const year = new Date().getFullYear() - i;
                                return (
                                    <option key={year} value={year}>{year}</option>
                                );
                            })}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="ml-4 text-blue-600 flex items-center hover:text-blue-800"
                    >
                        Descarca registru
                        <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>

                {/* Eco Code Row */}
                <div className="flex items-center border-b pb-4">
                    <label className="text-gray-700 font-medium w-28 mr-2">Codul Eco:</label>
                    <div className="relative flex-1">
                        <select
                            name="ecoCode"
                            value={filters.ecoCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            disabled={loading}
                        >
                            <option value="">Selectează Codul Eco</option>
                            {ecoCodes.map(eco => (
                                <option key={eco.code} value={eco.code}>
                                    {eco.code} - {eco.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Raion Row */}
                <div className="flex items-center border-b pb-4">
                    <label className="text-gray-700 font-medium w-28 mr-2">Raionul:</label>
                    <div className="relative flex-1">
                        <select
                            name="raionCode"
                            value={filters.raionCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            disabled={loading}
                        >
                            <option value="">Selectează Raionul</option>
                            {raions.map(raion => (
                                <option key={raion.code} value={raion.code}>
                                    {raion.code} - {raion.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Locality Row */}
                <div className="flex items-center border-b pb-4">
                    <label className="text-gray-700 font-medium w-28 mr-2">Localitatea:</label>
                    <div className="relative flex-1">
                        <select
                            name="localityCode"
                            value={filters.localityCode}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            disabled={loading || !filters.raionCode}
                        >
                            <option value="">Selectează Localitatea</option>
                            {localities.map(locality => (
                                <option key={locality.code} value={locality.code}>
                                    {locality.code} - {locality.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="mt-4 text-center">
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white font-bold py-2 px-4 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? 'Se procesează...' : 'Afișează codul IBAN'}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4">
                        <p>{error}</p>
                    </div>
                )}

                {/* Results Section */}
                {result && result.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Rezultatele căutării</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left">Cod IBAN</th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left">An</th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left">Cod Eco</th>
                                    <th className="py-2 px-4 border-b border-gray-200 text-left">Localitate</th>
                                </tr>
                                </thead>
                                <tbody>
                                {result.map((iban) => (
                                    <tr key={iban.id} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b border-gray-200">{iban.ibanCode}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{iban.year}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{iban.ecoCode}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{iban.localityName}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IbanSearch;