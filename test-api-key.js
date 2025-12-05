import axios from 'axios';

const API_KEY = '62a099c77d7063a2c77e124547efac79';
const BASE_URL = 'https://api.alliancelaundrydigital.com/v1';

async function testApi() {
    console.log('Testing API Key:', API_KEY);
    try {
        const response = await axios.get(`${BASE_URL}/locations?pageSize=10&page=1`, {
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log('Status:', response.status);
        console.log('Data count:', response.data?.data?.length || 0);
        if (response.data?.data?.length > 0) {
            console.log('First location:', response.data.data[0].name);
        } else {
            console.log('No locations found.');
        }
    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.statusText);
        console.error('Details:', error.response?.data);
    }
}

testApi();
