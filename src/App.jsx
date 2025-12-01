import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem('sq360_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = () => {
        localStorage.setItem('sq360_auth', 'true');
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('sq360_auth');
        setIsAuthenticated(false);
    };

    if (isLoading) return null;

    return (
        <div className="app">
            {!isAuthenticated ? (
                <Login onLogin={handleLogin} />
            ) : (
                <Dashboard onLogout={handleLogout} />
            )}
        </div>
    );
}

export default App;
