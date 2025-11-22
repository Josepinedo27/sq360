import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        server: {
            port: 3005,
            strictPort: true,
            proxy: {
                '/v1': {
                    target: 'https://api.alliancelaundrydigital.com',
                    changeOrigin: true,
                    secure: false,
                    headers: {
                        'x-api-key': env.VITE_API_KEY
                    }
                },
            },
        },
    }
})
