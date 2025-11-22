// Test script to explore Speed Queen API endpoints
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

async function testLocationReports() {
    try {
        console.log('🔍 Testing Speed Queen API endpoints for location-level reports...\n');

        // 1. Get locations first
        console.log('1️⃣ Fetching locations...');
        const locationsResponse = await api.get('/locations?pageSize=5');
        console.log('Raw response:', JSON.stringify(locationsResponse.data, null, 2));

        const locations = locationsResponse.data?.items || locationsResponse.data || [];

        if (!Array.isArray(locations) || locations.length === 0) {
            console.log('❌ No locations found or unexpected format');
            console.log('Response data type:', typeof locationsResponse.data);
            console.log('Response data:', locationsResponse.data);
            return;
        }

        const firstLocation = locations[0];
        console.log(`\n✅ Found ${locations.length} locations`);
        console.log(`   First location object:`, JSON.stringify(firstLocation, null, 2));
        console.log(`   Location ID: ${firstLocation.id}\n`);

        // 2. Try to get location-level reports
        const endDate = new Date().toISOString();
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();

        console.log('2️⃣ Testing location-level report endpoints...');
        console.log(`   Date range: ${startDate.split('T')[0]} to ${endDate.split('T')[0]}\n`);

        // Test different possible endpoints
        const endpointsToTest = [
            `/locations/${firstLocation.id}/reports/AUDIT_TOTAL_VENDING`,
            `/locations/${firstLocation.id}/reports/revenue`,
            `/locations/${firstLocation.id}/reports`,
            `/locations/${firstLocation.id}/revenue`,
            `/locations/${firstLocation.id}/analytics`,
        ];

        for (const endpoint of endpointsToTest) {
            try {
                console.log(`   Testing: ${endpoint}`);
                const response = await api.get(endpoint, {
                    params: { start: startDate, end: endDate },
                });
                console.log(`   ✅ SUCCESS! Endpoint works`);
                console.log(`   Response:`, JSON.stringify(response.data, null, 2).slice(0, 1000));
                console.log('\n');
            } catch (error) {
                if (error.response) {
                    console.log(`   ❌ ${error.response.status} - ${error.response.statusText}`);
                } else {
                    console.log(`   ❌ Error: ${error.message}`);
                }
            }
        }

        // 3. Get machines for the location to understand the structure
        console.log('3️⃣ Fetching machines for reference...');
        const machinesResponse = await api.get(`/locations/${firstLocation.id}/machines`);
        const machines = machinesResponse.data?.items || machinesResponse.data || [];
        console.log(`   Found ${machines.length} machines`);

        if (machines.length > 0) {
            const firstMachine = machines[0];
            console.log(`   First machine object:`, JSON.stringify(firstMachine, null, 2).slice(0, 300));
            console.log(`   Machine ID: ${firstMachine.id}\n`);

            // 4. Test machine-level report to see the structure
            console.log('4️⃣ Testing machine-level report (for reference)...');
            try {
                const machineReport = await api.get(
                    `/locations/${firstLocation.id}/machines/${firstMachine.id}/reports/AUDIT_TOTAL_VENDING`,
                    { params: { start: startDate, end: endDate } }
                );
                console.log('   ✅ Machine report structure:');
                console.log(JSON.stringify(machineReport.data, null, 2).slice(0, 1000));
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
                if (error.response) {
                    console.log(`   Status: ${error.response.status}`);
                }
            }
        }

    } catch (error) {
        console.error('\n❌ Error during API testing:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testLocationReports();
