import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-grow bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-gray-300 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
                    <p>IBAN Management System &copy; {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;