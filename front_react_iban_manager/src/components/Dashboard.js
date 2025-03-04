import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalIbans: 0,
        totalUsers: 3,
        totalEcoCodes: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [ibansResponse, usersResponse, ecoCodesResponse] = await Promise.all([
                    axios.get('/ibans', { headers }),
                    axios.get('/users', { headers }),
                    axios.get('/ibans/eco-codes', { headers })
                ]);

                setStats({
                    totalIbans: ibansResponse.data.length,
                    totalUsers: usersResponse.data.length,
                    totalEcoCodes: ecoCodesResponse.data.length
                });
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Panel Administrator</h1>

            <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px', fontSize: '20px' }}>📝</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>IBAN-uri</div>
                        <div>{stats.totalIbans}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px', fontSize: '20px' }}>👥</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Utilizatori</div>
                        <div>{stats.totalUsers}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px', fontSize: '20px' }}>🏷️</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Coduri Eco</div>
                        <div>{stats.totalEcoCodes}</div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '15px' }}>Acțiuni Rapide</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <Link to="/ibans/new" style={{ color: 'blue', textDecoration: 'none' }}>
                            + Adaugă IBAN Nou
                        </Link>
                    </div>
                    <div>
                        <Link to="/users/new" style={{ color: 'blue', textDecoration: 'none' }}>
                            👤 Adaugă Utilizator
                        </Link>
                    </div>
                    <div>
                        <Link to="/ibans" style={{ color: 'blue', textDecoration: 'none' }}>
                            📋 Vizualizare IBAN-uri
                        </Link>
                    </div>
                </div>
            </div>

            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>IBAN-uri Recente (2025)</h2>
                    <Link to="/ibans" style={{ color: 'blue', textDecoration: 'none' }}>
                        Vezi toate →
                    </Link>
                </div>

                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <div style={{ marginBottom: '10px' }}>Nu există IBAN-uri recente</div>
                    <Link to="/ibans/new" style={{ color: 'blue', textDecoration: 'none' }}>
                        Adaugă primul IBAN →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;