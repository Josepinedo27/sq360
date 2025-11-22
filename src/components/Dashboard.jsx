import React, { useEffect, useState } from 'react';
import { MapPin, DollarSign, RefreshCw } from 'lucide-react';
import StatCard from './StatCard';
import MonthSelector from './MonthSelector';
import LocationRevenueTable from './LocationRevenueTable';
import { getLocations, getLocationRevenue } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
    });
    const [locationRevenue, setLocationRevenue] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getMonthDateRange = (date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        return {
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };
    };

    const processRevenueByLocation = (revenueList, prevRevenueList, locations) => {
        const locationMap = {};
        locations.forEach(loc => {
            locationMap[loc.id] = {
                locationId: loc.id,
                locationName: loc.name,
                totalRevenue: 0,
                prevTotalRevenue: 0,
                machineCount: 0,
                machines: new Set()
            };
        });

        const processList = (list, isCurrent) => {
            if (Array.isArray(list)) {
                list.forEach(locationRecord => {
                    const locationId = locationRecord.id;

                    if (locationMap[locationId]) {
                        let locationTotal = 0;

                        if (Array.isArray(locationRecord.machines)) {
                            locationRecord.machines.forEach(machine => {
                                const amount = parseFloat(machine.totalVended || 0) / 100;
                                locationTotal += amount;

                                if (isCurrent && machine.id) {
                                    locationMap[locationId].machines.add(machine.id);
                                }
                            });
                        }

                        if (isCurrent) {
                            locationMap[locationId].totalRevenue = locationTotal;
                        } else {
                            locationMap[locationId].prevTotalRevenue = locationTotal;
                        }
                    }
                });
            }
        };

        processList(revenueList, true);
        processList(prevRevenueList, false);

        return Object.values(locationMap).map(loc => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
            totalRevenue: loc.totalRevenue,
            prevTotalRevenue: loc.prevTotalRevenue,
            machineCount: loc.machines.size
        }));
    };

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const locationsData = await getLocations();
            const locations = locationsData?.data || [];

            if (!Array.isArray(locations) || locations.length === 0) {
                setError('No se encontraron locaciones');
                setLoading(false);
                return;
            }

            const { startDate, endDate } = getMonthDateRange(selectedMonth);

            // Calculate previous month range
            const prevMonthDate = new Date(selectedMonth);
            prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
            const { startDate: prevStartDate, endDate: prevEndDate } = getMonthDateRange(prevMonthDate);

            const locationIds = locations.map(loc => loc.id);

            const [revenueData, prevRevenueData] = await Promise.all([
                getLocationRevenue(locationIds, startDate, endDate),
                getLocationRevenue(locationIds, prevStartDate, prevEndDate)
            ]);

            const revenueList = revenueData?.data?.locations || [];
            const prevRevenueList = prevRevenueData?.data?.locations || [];

            const revenueByLocation = processRevenueByLocation(revenueList, prevRevenueList, locations);

            const totalRevenue = revenueByLocation.reduce((sum, loc) => sum + loc.totalRevenue, 0);
            const prevTotalRevenue = revenueByLocation.reduce((sum, loc) => sum + loc.prevTotalRevenue, 0);

            setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue
            });

            setLocationRevenue(revenueByLocation);
            setLoading(false);

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Error al cargar los datos. Por favor verifica tu conexión.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="header">
                    <h1>Lavanti Dashboard</h1>
                </div>
                <div className="loading">
                    <RefreshCw className="animate-spin" size={48} />
                    <div style={{ marginTop: '1rem', color: '#888' }}>Cargando datos...</div>
                </div>
            </div>
        );
    }

    value = { stats.locations }
    subtext = "Total de sitios"
    icon = { MapPin }
    color = "var(--accent-color)"
        />
        <StatCard
            title="Revenue Total"
            value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtext={`${selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
            icon={DollarSign}
            color="var(--warning-color)"
        />
            </div >

    <LocationRevenueTable
        locationRevenue={locationRevenue}
        loading={loading}
    />
        </div >
    );
};

export default Dashboard;
