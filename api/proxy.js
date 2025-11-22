export default async function handler(req, res) {
    // Enable CORS with strict origin check
    const allowedOrigins = [
        'https://sq360.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ];

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { path } = req.query;
    const apiKey = process.env.SPEED_QUEEN_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    try {
        // Construct the target URL
        // req.url includes the query string, so we need to be careful not to duplicate it if we use a library
        // But here we are forwarding to a specific base URL.
        // The rewrite in vercel.json will send /v1/... to /api/proxy?path=... if we configure it that way,
        // OR we can just handle the path parsing from req.url if we use a catch-all route.

        // Let's assume standard Vercel function behavior where we might need to strip the /api/proxy prefix if it was a rewrite,
        // but usually for a proxy we want to forward the path.

        // Simpler approach: The frontend calls /v1/locations. Vercel rewrites /v1/(.*) to /api/proxy.
        // We need to forward to https://api.alliancelaundrydigital.com/v1/...

        // Let's use the full URL from the request but replace the host.
        // Actually, simpler: just use the path from the request URL.

        const targetUrl = `https://api.alliancelaundrydigital.com${req.url}`;

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
            },
            // body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Error fetching data from Speed Queen API' });
    }
}
