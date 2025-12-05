const https = require('https');
require('dotenv').config();

const API_KEY = process.env.VITE_API_KEY || process.env.VITE_SQ_API_KEY;

if (!API_KEY) {
    console.error('❌ API Key not found in environment variables');
    process.exit(1);
}

const locationIdToCheck = '550295'; // Try without 'loc_' prefix first as that's usually how IDs are
const locationIdToCheckWithPrefix = 'loc_550295';

console.log(`Checking for location ID: ${locationIdToCheck} or ${locationIdToCheckWithPrefix}`);

const options = {
    hostname: 'api.alliancelaundrydigital.com',
    path: '/v1/locations?pageSize=1000', // Fetch many to ensure we get it
    method: 'GET',
    headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            const locations = jsonData.data || [];

            console.log(`Fetched ${locations.length} locations.`);

            const foundLocation = locations.find(loc =>
                loc.id === locationIdToCheck ||
                loc.id === locationIdToCheckWithPrefix ||
                loc.locationId === locationIdToCheck ||
                loc.locationId === locationIdToCheckWithPrefix
            );

            if (foundLocation) {
                console.log('✅ Location FOUND!');
                console.log(JSON.stringify(foundLocation, null, 2));
            } else {
                console.log('❌ Location NOT found in the list.');
                // Print first 5 locations to see format
                console.log('First 5 locations IDs:', locations.slice(0, 5).map(l => l.id));
            }

        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw data preview:', data.substring(0, 200));
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
