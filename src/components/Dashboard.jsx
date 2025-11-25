import React, { useEffect, useState } from 'react';
import { MapPin, DollarSign, RefreshCw, Activity, Droplets, Flame, Zap } from 'lucide-react';
import StatCard from './StatCard';
import MonthSelector from './MonthSelector';
import LocationRevenueTable from './LocationRevenueTable';
import { getLocations, getLocationRevenue, getLocationCycleUsage } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0,
        electricConsumption: 0
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

    const processRevenueByLocation = (revenueList, prevRevenueList, locations, cycleList) => {
        const locationMap = {};
        locations.forEach(loc => {
            locationMap[loc.id] = {
                locationId: loc.id,
                locationName: loc.name,
                totalRevenue: 0,
                prevTotalRevenue: 0,
                machineCount: 0,
                machines: new Set(),
                waterConsumption: 0,
                gasConsumption: 0,
                electricConsumption: 0,
                totalCycles: 0
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

        // Calculate consumption per location
        if (Array.isArray(cycleList)) {
            cycleList.forEach(loc => {
                if (locationMap[loc.id] && loc.machines) {
                    let waterConsumption = 0;
                    let gasConsumption = 0;
                    let electricConsumption = 0;
                    let totalCycles = 0;

                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;
                        const model = (m.model || '').toUpperCase();

                        // Debug: log model to see what we're getting
                        if (cycles > 0) {
                            console.log('Machine:', m.name, 'Model:', model, 'Cycles:', cycles);
                        }

                        // Detect machine type by model prefix
                        if (model.startsWith('STG')) {
                            // Gas dryer (STG)
                            gasConsumption += cycles * 0.39;  // Gas: 0.39 m³ per cycle
                            electricConsumption += cycles * 0.19;  // Electric: 0.19 kW/hr per cycle
                        } else if (model.startsWith('STE')) {
                            // Electric dryer (STE) - NO gas
                            electricConsumption += cycles * 4.5;  // Electric: 4.5 kW/hr per cycle
                        } else {
                            // Washer (or unknown - assume washer)
                            waterConsumption += cycles * 77;  // Water: 77 L per cycle
                            electricConsumption += cycles * 0.35;  // Electric: 0.35 kW/hr per cycle
                        }
                    });

                    locationMap[loc.id].waterConsumption = waterConsumption;
                    locationMap[loc.id].gasConsumption = gasConsumption;
                    locationMap[loc.id].electricConsumption = electricConsumption;
                    locationMap[loc.id].totalCycles = totalCycles;
                }
            });
        }

        return Object.values(locationMap).map(loc => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
            totalRevenue: loc.totalRevenue,
            prevTotalRevenue: loc.prevTotalRevenue,
            machineCount: loc.machines.size,
            waterConsumption: loc.waterConsumption,
            gasConsumption: loc.gasConsumption,
            electricConsumption: loc.electricConsumption,
            totalCycles: loc.totalCycles
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

            const [revenueData, prevRevenueData, cycleData] = await Promise.all([
                getLocationRevenue(locationIds, startDate, endDate),
                getLocationRevenue(locationIds, prevStartDate, prevEndDate),
                getLocationCycleUsage(locationIds, startDate, endDate)
            ]);


            const revenueList = revenueData?.data?.locations || [];
            const prevRevenueList = prevRevenueData?.data?.locations || [];
            const cycleList = cycleData?.data?.locations || [];

            // Calculate total machines from revenue data
            let totalMachines = 0;
            revenueList.forEach(loc => {
                if (loc.machines && Array.isArray(loc.machines)) {
                    totalMachines += loc.machines.length;
                }
            });

            const revenueByLocation = processRevenueByLocation(revenueList, prevRevenueList, locations, cycleList);

            const totalRevenue = revenueByLocation.reduce((sum, loc) => sum + loc.totalRevenue, 0);
            const prevTotalRevenue = revenueByLocation.reduce((sum, loc) => sum + loc.prevTotalRevenue, 0);

            let totalCycles = 0;
            let totalWater = 0;
            let totalGas = 0;
            let totalElectric = 0;

            console.log('=== GLOBAL CALC START ===', 'Locations:', cycleList.length);

            cycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;
                        const model = (m.model || '').toUpperCase();
                        const typeChar = model.charAt(2);

                        // Debug: log global calculation
                        if (cycles > 0 && totalCycles < 300) {
                            console.log('GLOBAL:', m.name, 'Model:', model, 'Char:', typeChar, 'Cycles:', cycles, 'Gas so far:', totalGas);
                        }

                        if (model.charAt(2) === 'G' || model.charAt(2) === 'L') {
                            totalGas += cycles * 0.39;
                            totalElectric += cycles * 0.19;
                        } else if (model.charAt(2) === 'E') {
                            totalElectric += cycles * 4.5;
                        } else {
                            totalWater += cycles * 77;
                            totalElectric += cycles * 0.35;
                        }
                    });
                }
            });

            console.log('=== FINAL TOTALS ===', 'Gas:', totalGas, 'Water:', totalWater, 'Electric:', totalElectric);

            const avgCyclesPerMachine = totalMachines > 0 ? (totalCycles / totalMachines) : 0;

            const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
            const avgDailyCycles = totalMachines > 0 ? (totalCycles / (daysInMonth * totalMachines)) : 0;

            const waterConsumption = totalWater;
            const gasConsumption = totalGas;
            const electricConsumption = totalElectric;

            setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption,
                electricConsumption
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

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1>Speed Queen 360</h1>
                <div className="header-controls">
                    <MonthSelector
                        selectedDate={selectedMonth}
                        onDateChange={setSelectedMonth}
                    />
                    <button
                        onClick={fetchData}
                        className="refresh-btn"
                        aria-label="Actualizar datos"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="grid">
                <StatCard
                    title="Locaciones Operativas"
                    value={stats.locations}
                    subtext="Total de sitios"
                    icon={MapPin}
                    color="var(--accent-color)"
                />
                <StatCard
                    title="Revenue Total"
                    value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext={`${selectedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
                    icon={DollarSign}
                    color="var(--warning-color)"
                />
                <StatCard
                    title="Ciclos Totales"
                    value={stats.totalCycles.toLocaleString()}
                    subtext="Ciclos en el mes"
                    icon={Activity}
                    color="#3B82F6"
                />
                <StatCard
                    title="Promedio Ciclos/Equipo"
                    value={stats.avgCyclesPerMachine.toFixed(1)}
                    subtext="En el mes"
                    icon={RefreshCw}
                    color="#10B981"
                />
                <StatCard
                    title="Promedio Diario/Equipo"
                    value={stats.avgDailyCycles.toFixed(1)}
                    subtext="Por día"
                    icon={Activity}
                    color="#8B5CF6"
                />
                <StatCard
                    title="Consumo Agua"
                    value={`${stats.waterConsumption.toLocaleString()} L`}
                    subtext="Estimado (Lavadoras)"
                    icon={Droplets}
                    color="#0EA5E9"
                />
                <StatCard
                    title="Consumo Gas"
                    value={`${stats.gasConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`}
                    subtext="Estimado (Secadoras STG)"
                    icon={Flame}
                    color="#F59E0B"
                />
                <StatCard
                    title="Consumo Eléctrico"
                    value={`${stats.electricConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW/h`}
                    subtext="Total estimado"
                    icon={Zap}
                    color="#eab308"
                />
            </div>

            <LocationRevenueTable
                locationRevenue={locationRevenue}
                loading={loading}
            />
        </div>
    );
};

export default Dashboard;

