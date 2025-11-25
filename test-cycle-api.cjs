// Quick test to see what fields we have in cycle usage API
const https = require('https');

const apiKey = process.env.VITE_SQ_API_KEY;
if (!apiKey) {
    console.error('VITE_SQ_API_KEY not found in environment');
    process.exit(1);
}

const options = {
    hostname: 'api.speedqueencommercial.com',
    path: '/api/v1/location/cycle-usage?locationIds=2046&startDate=2025-11-01T00:00:00.000Z&endDate=2025-11-30T23:59:59.999Z',
    headers: {
        'x-api-key': apiKey
    }
};

https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const json = JSON.parse(data);
        if (json.data && json.data.locations && json.data.locations[0] && json.data.locations[0].machines) {
            const machine = json.data.locations[0].machines[0];
            console.log('\n=== FIRST MACHINE OBJECT ===');
            console.log(JSON.stringify(machine, null, 2));
            console.log('\n=== ALL FIELDS ===');
            console.log(Object.keys(machine));
        }
    });
}).on('error', (err) => {
    console.error('Error:', err);
});
