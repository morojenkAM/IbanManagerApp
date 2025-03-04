import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './components/Dashboard';
import IbanList from './pages/IbanList';
import IbanForm from './pages/IbanForm';
import IbanSearch from './pages/IbanSearch';
import UserForm from './pages/UserForm';
import UserManagement from './pages/UserManagement';
import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Admin routes */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN']}>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN']}>
                            <UserManagement />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/users/new"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN']}>
                            <UserForm />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/users/edit/:id"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN']}>
                            <UserForm />
                        </PrivateRoute>
                    }
                />

                {/* IBAN routes */}
                <Route
                    path="/ibans"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_OPERATOR_RAION']}>
                            <IbanList />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/ibans/search"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_OPERATOR_RAION']}>
                            <IbanSearch />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/ibans/new"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_OPERATOR']}>
                            <IbanForm />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/ibans/edit/:id"
                    element={
                        <PrivateRoute roles={['ROLE_ADMIN', 'ROLE_OPERATOR']}>
                            <IbanForm />
                        </PrivateRoute>
                    }
                />

                {/* Error routes */}
                <Route
                    path="/unauthorized"
                    element={
                        <PrivateRoute>
                            <Unauthorized />
                        </PrivateRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;