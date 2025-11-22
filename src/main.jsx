import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

console.log('main.jsx: Starting React app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
    console.error('main.jsx: Root element not found!');
} else {
    try {
        const root = ReactDOM.createRoot(rootElement);
        console.log('main.jsx: Root created, rendering...');
        root.render(
            <React.StrictMode>
                <ErrorBoundary>
                    <App />
                </ErrorBoundary>
            </React.StrictMode>
        );
        console.log('main.jsx: Render complete');
    } catch (e) {
        console.error('main.jsx: Error mounting React app:', e);
    }
}
