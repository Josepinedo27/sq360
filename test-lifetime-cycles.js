import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_API_KEY;
const BASE_URL = 'https://api.alliancelaundrydigital.com/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
    },
});

async function testLifetimeCycles() {
    try {
        console.log('🔍 Testing for Lifetime Cycles...\n');

        // 1. Get a location
        const locationsResponse = await api.get('/locations?pageSize=1');
        const location = locationsResponse.data.data[0];
        console.log('   ❌ No obvious cycle count on machine object');
    }

        // 3. Test Report IDs
        const reportIds = [
        'AUDIT_TOTAL_CYCLES',
        'AUDIT_LIFETIME_CYCLES',
        'AUDIT_CYCLE_COUNTS',
        'AUDIT_CYCLES',
        'AUDIT_CYCLE_USAGE', // Known one, but maybe with wide date range?
        'AUDIT_MACHINE_USAGE'
    ];

    const endDate = new Date().toISOString();
    const startDate = new Date('2000-01-01').toISOString(); // Way back

    console.log('\n🧪 Testing Report IDs...');

    for (const reportId of reportIds) {
        try {
            console.log(`   Testing ${reportId}...`);
            const response = await api.get(`/locations/${location.id}/machines/${machine.id}/reports/${reportId}`, {
                params: { start: startDate, end: endDate }
            });
            console.log(`   ✅ SUCCESS! ${reportId}`);
            console.log(`   Data:`, JSON.stringify(response.data, null, 2).slice(0, 200));
        } catch (error) {
            console.log(`   ❌ FAILED ${reportId}: ${error.response ? error.response.status : error.message}`);
        }
    }

} catch (error) {
    console.error('Error:', error.message);
}
}

testLifetimeCycles();
