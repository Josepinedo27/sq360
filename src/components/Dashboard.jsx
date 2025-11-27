import React, { useEffect, useState } from 'react';
import { MapPin, DollarSign, RefreshCw, Activity, Droplets, Flame, Zap } from 'lucide-react';
import StatCard from './StatCard';
import DateRangeSelector from './DateRangeSelector';
import LocationRevenueTable from './LocationRevenueTable';
import MachineComparisonTable from './MachineComparisonTable';
import { getLocations, getLocationRevenue, getLocationCycleUsage, getLocationLifetimeCycles, getMachines } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        prevTotalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0,
        electricityConsumption: 0,
        washerCycles: 0,
        dryerCycles: 0,
        dryerCyclesSTE: 0,
        dryerCyclesSTG: 0
    });
    const [locationRevenue, setLocationRevenue] = useState([]);
    const [cycleList, setCycleList] = useState([]);
    const [prevCycleList, setPrevCycleList] = useState([]);
    const [locations, setLocations] = useState([]);
    const [modelCounts, setModelCounts] = useState({ STE: 0, STG: 0, other: 0 });
    const [machineModels, setMachineModels] = useState({}); // Map: machineId -> modelNumber
    const [loadingModels, setLoadingModels] = useState(false);

    // Initialize with current month
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        return {
            startDate: new Date(now.getFullYear(), now.getMonth(), 1),
            endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleDateRangeChange = (start, end) => {
        setDateRange({ startDate: start, endDate: end });
    };

    const getPreviousPeriod = (start, end) => {
        const duration = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1); // 1ms before start
        const prevStart = new Date(prevEnd.getTime() - duration);
        return { prevStart, prevEnd };
    };

    const processRevenueByLocation = (revenueList, prevRevenueList, locations, cycleList, currentMachineModels = {}, daysInRange = 1) => {
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
                electricityConsumption: 0,
                totalCycles: 0,
                machinesDetails: []
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

                                    // Store machine details for breakdown
                                    // We'll calculate percentage later once we have the full locationTotal
                                    locationMap[locationId].machinesDetails.push({
                                        id: machine.id,
                                        name: machine.name || `Machine ${machine.id}`,
                                        revenue: amount,
                                        type: 'Unknown' // Will be updated with node logic later if needed, or just use name
                                    });
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
        processList(revenueList, true);
        processList(prevRevenueList, false);

        // Calculate percentages for machine details
        Object.values(locationMap).forEach(loc => {
            if (loc.totalRevenue > 0 && loc.machinesDetails.length > 0) {
                loc.machinesDetails.forEach(machine => {
                    machine.percentage = (machine.revenue / loc.totalRevenue) * 100;

                    // Try to determine type from name if possible (Node parity logic)
                    const match = machine.name.match(/(\d+)(?!.*\d)/);
                    const nodeNum = match ? parseInt(match[0], 10) : 0;
                    if (nodeNum > 0) {
                        machine.type = (nodeNum % 2 !== 0) ? 'Secadora' : 'Lavadora';
                    }
                });
            }
        });

        // Calculate consumption per location
        if (Array.isArray(cycleList)) {
            cycleList.forEach(loc => {
                if (locationMap[loc.id] && loc.machines) {
                    let washerCycles = 0;
                    let dryerCycles = 0;
                    let totalCycles = 0;
                    let locWater = 0;
                    let locGas = 0;
                    let locElectricity = 0;

                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;
                        const model = currentMachineModels[m.id] || '';

                        // Extract node number from name
                        const name = m.name || '';
                        const match = name.match(/(\d+)(?!.*\d)/);
                        const nodeNum = match ? parseInt(match[0], 10) : 0;

                        const isWasher = nodeNum > 0 && nodeNum % 2 === 0;
                        const isDryer = nodeNum > 0 && nodeNum % 2 !== 0;

                        if (isDryer) dryerCycles += cycles;
                        else if (isWasher) washerCycles += cycles;

                        // Update machine details with cycle info
                        const machineDetail = locationMap[loc.id].machinesDetails.find(md => md.id === m.id);
                        if (machineDetail) {
                            machineDetail.totalCycles = cycles;
                            machineDetail.avgDailyCycles = daysInRange > 0 ? (cycles / daysInRange) : 0;
                        } else {
                            // If machine was not in revenue list (no revenue), add it now?
                            // Usually we only care about machines with revenue or we want to see all?
                            // The user asked for "revenue per node", implying we list machines.
                            // If a machine has 0 revenue but has cycles, it should probably be listed.
                            // But for now let's stick to updating existing ones or we can push new ones.
                            // Let's just update existing ones to avoid duplicates if logic is complex.
                            // Actually, if it's not in revenue list, it means 0 revenue.
                            // We should probably add it if we want a complete picture, but let's stick to the requested scope first.
                        }

                        // Consumption Logic
                        if (model.startsWith('STE')) {
                            if (isWasher) {
                                locWater += cycles * 77;
                                locElectricity += cycles * 0.37;
                            } else if (isDryer) {
                                locElectricity += cycles * 3.9;
                            }
                        } else if (model.startsWith('STG')) {
                            if (isWasher) {
                                locWater += cycles * 77;
                                locElectricity += cycles * 0.37;
                            } else if (isDryer) {
                                locElectricity += cycles * 0.15;
                                locGas += cycles * 0.39;
                            }
                        } else {
                            // Default fallback if model not yet loaded or unknown:
                            // We can keep 0 or use the old estimation logic. 
                            // For now, let's stick to 0 to avoid "ghost" consumption before load.
                            // But the user wants to see *something*. 
                            // The previous logic was: washer * 77L water, dryer * 0.39 gas.
                            // Let's ONLY apply that if we have NO model info yet? 
                            // No, better to rely on the model scan.
                        }
                    });

                    locationMap[loc.id].waterConsumption = locWater;
                    locationMap[loc.id].gasConsumption = locGas;
                    locationMap[loc.id].electricityConsumption = locElectricity;
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
            electricityConsumption: loc.electricityConsumption,
            totalCycles: loc.totalCycles,
            machineDetails: Array.from(loc.machinesDetails || []).sort((a, b) => b.revenue - a.revenue)
        }));
    };

    const calculateConsumption = (currentCycleList, currentMachineModels) => {
        let water = 0;
        let gas = 0;
        let electricity = 0;
        let dryerSTE = 0;
        let dryerSTG = 0;

        if (Array.isArray(currentCycleList)) {
            currentCycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        const model = currentMachineModels[m.id] || '';
                        // if (cycles > 0) console.log(`Calc: Machine ${m.id} (${m.name}) Model: ${model} Cycles: ${cycles}`); // Debug

                        // Extract node number from name to determine if it's washer (even) or dryer (odd)
                        // Assuming format "Machine Node - X" or similar where X is the node number
                        const name = m.name || '';
                        const match = name.match(/(\d+)(?!.*\d)/);
                        const nodeNum = match ? parseInt(match[0], 10) : 0;

                        // Washer is Even, Dryer is Odd
                        const isWasher = nodeNum > 0 && nodeNum % 2 === 0;
                        const isDryer = nodeNum > 0 && nodeNum % 2 !== 0;

                        if (model.startsWith('STE')) {
                            // Electric Stack
                            if (isWasher) {
                                // Washer Node: Water 77L, Elec 0.37kWh, Gas 0
                                water += cycles * 77;
                                electricity += cycles * 0.37;
                            } else if (isDryer) {
                                // Dryer Node: Water 0, Elec 3.9kWh, Gas 0
                                electricity += cycles * 3.9;
                                dryerSTE += cycles;
                            }
                        } else if (model.startsWith('STG')) {
                            // Gas Stack
                            if (isWasher) {
                                // Washer Node: Water 77L, Elec 0.37kWh, Gas 0
                                water += cycles * 77;
                                electricity += cycles * 0.37;
                            } else if (isDryer) {
                                // Dryer Node: Water 0, Elec 0.15kWh, Gas 0.39m3
                                electricity += cycles * 0.15;
                                gas += cycles * 0.39;
                                dryerSTG += cycles;
                            }
                        }
                        // Other models are omitted (0 consumption)
                    });
                }
            });
        }

        return { water, gas, electricity, dryerSTE, dryerSTG };
    };

    const fetchMachineModels = async (locationsList) => {
        setLoadingModels(true);
        // Use a local map to accumulate results, but also update state incrementally
        const modelsMap = { ...machineModels };
        let steCount = modelCounts.STE;
        let stgCount = modelCounts.STG;
        let otherCount = modelCounts.other;

        try {
            // Process in batches of 20 to avoid rate limits
            const batchSize = 20;
            for (let i = 0; i < locationsList.length; i += batchSize) {
                const batch = locationsList.slice(i, i + batchSize);
                await Promise.all(batch.map(async (loc) => {
                    try {
                        const response = await getMachines(loc.id);
                        const machines = response.data || [];
                        machines.forEach(m => {
                            if (m.id && m.modelNumber) {
                                modelsMap[m.id] = m.modelNumber;
                                if (m.modelNumber.startsWith('STE')) steCount++;
                                else if (m.modelNumber.startsWith('STG')) stgCount++;
                                else otherCount++;
                            }
                        });
                    } catch (err) {
                        console.error(`Error fetching machines for location ${loc.id}:`, err);
                    }
                }));

                // Update state incrementally after each batch
                setModelCounts({ STE: steCount, STG: stgCount, other: otherCount });
                setMachineModels({ ...modelsMap });
            }
        } catch (error) {
            console.error('Error fetching machine models:', error);
        } finally {
            setLoadingModels(false);
        }
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

            const startDateStr = dateRange.startDate.toISOString();
            // Ensure end date covers the full day
            const endDateObj = new Date(dateRange.endDate);
            endDateObj.setHours(23, 59, 59, 999);
            const endDateStr = endDateObj.toISOString();

            // Calculate previous period
            const { prevStart, prevEnd } = getPreviousPeriod(dateRange.startDate, endDateObj);
            const prevStartDateStr = prevStart.toISOString();
            const prevEndDateStr = prevEnd.toISOString();

            // Calculate days in selected range
            const daysInRange = Math.max(1, Math.ceil((endDateObj - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1);

            const locationIds = locations.map(loc => loc.id);

            const [revenueData, prevRevenueData, cycleData, prevCycleData, lifetimeCycleData] = await Promise.all([
                getLocationRevenue(locationIds, startDateStr, endDateStr),
                getLocationRevenue(locationIds, prevStartDateStr, prevEndDateStr),
                getLocationCycleUsage(locationIds, startDateStr, endDateStr),
                getLocationCycleUsage(locationIds, prevStartDateStr, prevEndDateStr),
                getLocationLifetimeCycles(locationIds)
            ]);

            const revenueList = revenueData?.data?.locations || [];
            const prevRevenueList = prevRevenueData?.data?.locations || [];
            const cycleList = cycleData?.data?.locations || [];
            const prevCycleList = prevCycleData?.data?.locations || [];
            const lifetimeList = lifetimeCycleData?.data?.locations || [];

            // Merge lifetime cycles into cycleList
            cycleList.forEach(loc => {
                const lifetimeLoc = lifetimeList.find(l => l.id === loc.id);
                if (loc.machines && lifetimeLoc?.machines) {
                    loc.machines.forEach(m => {
                        // Debug model number
                        if (!m.modelNumber && Math.random() < 0.01) console.log('Machine data sample:', m);

                        const lifetimeMachine = lifetimeLoc.machines.find(lm => lm.id === m.id);
                        m.lifetimeCycles = lifetimeMachine ? parseInt(lifetimeMachine.totalCycles || 0, 10) : 0;
                    });
                }
            });

            // Calculate total machines from revenue data
            let totalMachines = 0;
            revenueList.forEach(loc => {
                if (loc.machines && Array.isArray(loc.machines)) {
                    totalMachines += loc.machines.length;
                }
            });

            const revenueByLocation = processRevenueByLocation(revenueList, prevRevenueList, locations, cycleList, machineModels, daysInRange);

            const totalRevenue = revenueByLocation.reduce((sum, loc) => sum + loc.totalRevenue, 0);
            const prevTotalRevenue = revenueByLocation.reduce((sum, loc) => sum + loc.prevTotalRevenue, 0);

            let totalCycles = 0;
            let prevTotalCycles = 0;
            let washerCycles = 0;
            let dryerCycles = 0;

            cycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;

                        const name = m.name || '';
                        const match = name.match(/(\d+)(?!.*\d)/);
                        const nodeNum = match ? parseInt(match[0], 10) : 0;

                        if (nodeNum > 0) {
                            if (nodeNum % 2 !== 0) {
                                dryerCycles += cycles;
                            } else {
                                washerCycles += cycles;
                            }
                        }
                    });
                }
            });

            // Calculate previous month cycles
            prevCycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        prevTotalCycles += cycles;
                    });
                }
            });

            const avgCyclesPerMachine = totalMachines > 0 ? (totalCycles / totalMachines) : 0;
            const avgDailyCycles = totalMachines > 0 ? (totalCycles / (daysInRange * totalMachines)) : 0;

            // Initial consumption calculation (will be 0 or based on defaults until models load)
            // We will update this in a useEffect when machineModels changes
            const waterConsumption = 0;
            const gasConsumption = 0;
            const electricityConsumption = 0;

            setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                prevTotalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption,
                electricityConsumption,
                washerCycles,
                dryerCycles
            });

            setLocationRevenue(revenueByLocation);
            setCycleList(cycleList);
            setPrevCycleList(prevCycleList);
            setLocations(locations);
            setLoading(false);

            // Trigger background fetch of machine models
            fetchMachineModels(locations);

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Error al cargar los datos. Por favor verifica tu conexi\u00F3n.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    // Recalculate consumption when machine models are loaded or cycle list changes
    useEffect(() => {
        if (Object.keys(machineModels).length > 0 && cycleList.length > 0) {
            const { water, gas, electricity, dryerSTE, dryerSTG } = calculateConsumption(cycleList, machineModels);
            setStats(prev => ({
                ...prev,
                waterConsumption: water,
                gasConsumption: gas,
                electricityConsumption: electricity,
                dryerCyclesSTE: dryerSTE,
                dryerCyclesSTG: dryerSTG
            }));

            // Also update location revenue table with new consumption data
            // We need to access revenueList and prevRevenueList which are not in state directly as raw lists
            // But we have 'locationRevenue' state. We can re-process or just update it.
            // Since processRevenueByLocation needs raw lists, and we don't want to store them all in state if not needed,
            // we can optimize. But for now, let's assume we can re-calculate if we had the raw data.
            // Actually, we don't have the raw revenue lists in state. 
            // Let's modify 'locationRevenue' state directly by mapping over it.

            setLocationRevenue(prevLocRevenue => {
                return prevLocRevenue.map(loc => {
                    // Find the cycle data for this location
                    const locCycles = cycleList.find(l => l.id === loc.locationId);
                    let locWater = 0;
                    let locGas = 0;
                    let locElectricity = 0;

                    if (locCycles && locCycles.machines) {
                        locCycles.machines.forEach(m => {
                            const cycles = parseInt(m.totalCycles || 0, 10);
                            const model = machineModels[m.id] || '';
                            const name = m.name || '';
                            const match = name.match(/(\d+)(?!.*\d)/);
                            const nodeNum = match ? parseInt(match[0], 10) : 0;
                            const isWasher = nodeNum > 0 && nodeNum % 2 === 0;
                            const isDryer = nodeNum > 0 && nodeNum % 2 !== 0;

                            if (model.startsWith('STE')) {
                                if (isWasher) {
                                    locWater += cycles * 77;
                                    locElectricity += cycles * 0.37;
                                } else if (isDryer) {
                                    locElectricity += cycles * 3.9;
                                }
                            } else if (model.startsWith('STG')) {
                                if (isWasher) {
                                    locWater += cycles * 77;
                                    locElectricity += cycles * 0.37;
                                } else if (isDryer) {
                                    locElectricity += cycles * 0.15;
                                    locGas += cycles * 0.39;
                                }
                            }
                        });
                    }

                    return {
                        ...loc,
                        waterConsumption: locWater,
                        gasConsumption: locGas,
                        electricityConsumption: locElectricity
                    };
                });
            });

        }
    }, [machineModels, cycleList]);

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
                    <DateRangeSelector
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onRangeChange={handleDateRangeChange}
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
                    subtext="En el periodo seleccionado"
                    icon={DollarSign}
                    color="var(--warning-color)"
                />
                <StatCard
                    title="Ciclos Totales"
                    value={stats.totalCycles.toLocaleString()}
                    subtext={(() => {
                        const delta = stats.totalCycles - stats.prevTotalCycles;
                        const percentChange = stats.prevTotalCycles > 0 ? ((delta / stats.prevTotalCycles) * 100) : 0;
                        const sign = delta > 0 ? '+' : '';
                        return `${sign}${percentChange.toFixed(1)}% vs periodo anterior`;
                    })()}
                    icon={Activity}
                    color="#3B82F6"
                    details={[
                        { label: 'Lavado', value: stats.washerCycles.toLocaleString() },
                        { label: 'Secado Total', value: stats.dryerCycles.toLocaleString() },
                        { label: '↳ Secado STE', value: (stats.dryerCyclesSTE || 0).toLocaleString() },
                        { label: '↳ Secado STG', value: (stats.dryerCyclesSTG || 0).toLocaleString() }
                    ]}
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
                    subtext={"Por d\u00EDa"}
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
                    value={`${stats.gasConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m\u00B3`}
                    subtext="Estimado (Modelos STG)"
                    icon={Flame}
                    color="#F59E0B"
                />
                <StatCard
                    title={"Consumo El\u00E9ctrico"}
                    value={`${stats.electricityConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh`}
                    subtext="Estimado (STE + STG)"
                    icon={Zap}
                    color="#EAB308"
                />
            </div>

            {/* Model Counts Section */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-header">
                    <Activity size={20} style={{ marginRight: '0.5rem' }} />
                    Desglose de Modelos (Detectados)
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div>
                        <div className="card-subtext">Modelos STE (El{"\u00E9"}ctricos)</div>
                        <div className="card-value" style={{ fontSize: '1.5rem', color: '#3B82F6' }}>
                            {loadingModels ? '...' : modelCounts.STE}
                        </div>
                    </div>
                    <div>
                        <div className="card-subtext">Modelos STG (Gas)</div>
                        <div className="card-value" style={{ fontSize: '1.5rem', color: '#F59E0B' }}>
                            {loadingModels ? '...' : modelCounts.STG}
                        </div>
                    </div>
                    <div>
                        <div className="card-subtext">Otros</div>
                        <div className="card-value" style={{ fontSize: '1.5rem', color: '#9CA3AF' }}>
                            {loadingModels ? '...' : modelCounts.other}
                        </div>
                    </div>
                    {loadingModels && <div style={{ marginLeft: 'auto', color: '#888' }}>Escaneando máquinas...</div>}
                </div>
            </div>

            <LocationRevenueTable
                locationRevenue={locationRevenue}
                loading={loading}
            />

            <MachineComparisonTable
                cycleList={cycleList}
                prevCycleList={prevCycleList}
                locations={locations}
            />
        </div>
    );
};

export default Dashboard;
