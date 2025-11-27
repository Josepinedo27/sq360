const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'src', 'components', 'Dashboard.jsx');
let content = fs.readFileSync(dashboardPath, 'utf8');

// 1. Add prevTotalCycles to state initialization
content = content.replace(
    `    const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0
    });`,
    `    const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        prevTotalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0
    });`
);

// 2. Add prevCycleData to Promise.all
content = content.replace(
    `            const [revenueData, prevRevenueData, cycleData] = await Promise.all([
                getLocationRevenue(locationIds, startDate, endDate),
                getLocationRevenue(locationIds, prevStartDate, prevEndDate),
                getLocationCycleUsage(locationIds, startDate, endDate)
            ]);`,
    `            const [revenueData, prevRevenueData, cycleData, prevCycleData] = await Promise.all([
                getLocationRevenue(locationIds, startDate, endDate),
                getLocationRevenue(locationIds, prevStartDate, prevEndDate),
                getLocationCycleUsage(locationIds, startDate, endDate),
                getLocationCycleUsage(locationIds, prevStartDate, prevEndDate)
            ]);`
);

// 3. Extract prevCycleList
content = content.replace(
    `            const revenueList = revenueData?.data?.locations || [];
            const prevRevenueList = prevRevenueData?.data?.locations || [];
            const cycleList = cycleData?.data?.locations || [];`,
    `            const revenueList = revenueData?.data?.locations || [];
            const prevRevenueList = prevRevenueData?.data?.locations || [];
            const cycleList = cycleData?.data?.locations || [];
            const prevCycleList = prevCycleData?.data?.locations || [];`
);

// 4. Calculate prevTotalCycles
content = content.replace(
    `            let totalCycles = 0;
            let washerCycles = 0;
            let dryerCycles = 0;

            cycleList.forEach(loc => {`,
    `            let totalCycles = 0;
            let prevTotalCycles = 0;
            let washerCycles = 0;
            let dryerCycles = 0;

            cycleList.forEach(loc => {`
);

// 5. Add calculation for prevTotalCycles after current cycles calculation
const afterCurrentCycles = `            });

            const avgCyclesPerMachine =`;

const replacement = `            });

            // Calculate previous month cycles
            prevCycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        prevTotalCycles += cycles;
                    });
                }
            });

            const avgCyclesPerMachine =`;

content = content.replace(afterCurrentCycles, replacement);

// 6. Add prevTotalCycles to setStats
content = content.replace(
    `            setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption
            });`,
    `            setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                prevTotalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption
            });`
);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('✅ Dashboard.jsx actualizado correctamente');
console.log('✅ prevTotalCycles agregado al estado');
console.log('✅ Llamada API para obtener ciclos del mes anterior agregada');
console.log('✅ Cálculo de prevTotalCycles implementado');
