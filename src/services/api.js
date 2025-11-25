import axios from 'axios';

const BASE_URL = '/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getLocations = async () => {
    try {
        let allLocations = [];
        let page = 1;
        let hasMore = true;
        const pageSize = 100;

        while (hasMore) {
            const response = await api.get(`/locations?pageSize=${pageSize}&page=${page}`);
            const locations = response.data.data || [];

            if (locations.length > 0) {
                allLocations = [...allLocations, ...locations];
                page++;

                // Check if we've reached the last page based on meta info or array length
                if (locations.length < pageSize) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
        }

        return { data: allLocations };
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
};

export const getMachines = async (locationId) => {
    try {
        const response = await api.get(`/locations/${locationId}/machines`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching machines for location ${locationId}:`, error);
        throw error;
    }
};

export const getMachineCycleUsage = async (locationId, machineId, start, end) => {
    try {
        const response = await api.get(`/locations/${locationId}/machines/${machineId}/reports/AUDIT_CYCLE_USAGE`, {
            params: { start, end },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching cycle usage for machine ${machineId}:`, error);
        return null;
    }
};

export const getMachineRevenue = async (locationId, machineId, start, end) => {
    try {
        const response = await api.get(`/locations/${locationId}/machines/${machineId}/reports/AUDIT_TOTAL_VENDING`, {
            params: { start, end },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching revenue for machine ${machineId}:`, error);
        return null;
    }
};

export const getLocationRevenue = async (locationIds, startDate, endDate) => {
    try {
        const response = await api.get('/reports', {
            params: {
                reportId: 'AUDIT_TOTAL_VENDING',
                locationIds: Array.isArray(locationIds) ? locationIds.join(',') : locationIds,
                startDate,
                endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching location revenue:', error);
        throw error;
    }
};

export const getLocationCycleUsage = async (locationIds, startDate, endDate) => {
    try {
        const response = await api.get('/reports', {
            params: {
                reportId: 'AUDIT_CYCLE_USAGE',
                locationIds: Array.isArray(locationIds) ? locationIds.join(',') : locationIds,
                startDate,
                endDate
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching location cycle usage:', error);
        throw error;
    }
};
