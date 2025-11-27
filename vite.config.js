import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get the API key right away
const API_KEY = process.env.VITE_API_KEY

if (!API_KEY) {
    console.error('⚠️  VITE_API_KEY not found in .env file!');
} else {
    console.log('✓ API Key loaded successfully');
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3005,
        strictPort: true,
        proxy: {
            '/v1': {
                target: 'https://api.alliancelaundrydigital.com',
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        // Set the API key from the variable loaded at startup
                        if (API_KEY) {
                            proxyReq.setHeader('x-api-key', API_KEY);
                            console.log('✓ API Key set for request:', req.method, req.url);
                        } else {
                            console.error('✗ API Key is undefined');
                        }
                    });
                    proxy.on('error', (err, req, res) => {
                        console.error('❌ Proxy error:', err.message);
                    });
                    proxy.on('proxyRes', (proxyRes, req, res) => {
                        console.log('📡 Response:', proxyRes.statusCode, req.url);
                    });
                }
            },
        },
    },
})
