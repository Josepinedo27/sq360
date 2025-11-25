const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// Update return statement
const oldReturn = `return Object.values(locationMap).map(loc => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
            totalRevenue: loc.totalRevenue,
            prevTotalRevenue: loc.prevTotalRevenue,
            machineCount: loc.machines.size,
            waterConsumption: loc.waterConsumption,
            gasConsumption: loc.gasConsumption,
            totalCycles: loc.totalCycles
        }));`;

const newReturn = `return Object.values(locationMap).map(loc => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
            totalRevenue: loc.totalRevenue,
            prevTotalRevenue: loc.prevTotalRevenue,
            machineCount: loc.machines.size,
            waterConsumption: loc.waterConsumption,
            gasConsumption: loc.gasConsumption,
            electricConsumption: loc.electricConsumption,
            totalCycles: loc.totalCycles
        }));`;

content = content.replace(oldReturn, newReturn);

// Update global calculation logic
const oldGlobal = `let totalCycles = 0;
            let washerCycles = 0;
            let dryerCycles = 0;

            cycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;

                        const name = m.name || '';
                        const match = name.match(/(\\d+)(?!.*\\d)/);
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

            const avgCyclesPerMachine = totalMachines > 0 ? (totalCycles / totalMachines) : 0;

            const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
            const avgDailyCycles = totalMachines > 0 ? (totalCycles / (daysInMonth * totalMachines)) : 0;

            const waterConsumption = washerCycles * 77;
            const gasConsumption = dryerCycles * 0.39;`;

const newGlobal = `let totalCycles = 0;
            let totalWater = 0;
            let totalGas = 0;
            let totalElectric = 0;

            cycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;
                        const model = (m.model || '').toUpperCase();

                        if (model.startsWith('STG')) {
                            totalGas += cycles * 0.39;
                            totalElectric += cycles * 0.19;
                        } else if (model.startsWith('STE')) {
                            totalElectric += cycles * 4.5;
                        } else {
                            totalWater += cycles * 77;
                            totalElectric += cycles * 0.35;
                        }
                    });
                }
            });

            const avgCyclesPerMachine = totalMachines > 0 ? (totalCycles / totalMachines) : 0;

            const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
            const avgDailyCycles = totalMachines > 0 ? (totalCycles / (daysInMonth * totalMachines)) : 0;

            const waterConsumption = totalWater;
            const gasConsumption = totalGas;
            const electricConsumption = totalElectric;`;

content = content.replace(oldGlobal, newGlobal);

// Update setStats
const oldSetStats = `setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption
            });`;

const newSetStats = `setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption,
                electricConsumption
            });`;

content = content.replace(oldSetStats, newSetStats);

// Add electric stat card
const gasCard = `<StatCard
                    title="Consumo Gas"
                    value={\`\${stats.gasConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³\`}
                    subtext="Estimado (Secadoras)"
                    icon={Flame}
                    color="#F59E0B"
                />
            </div>`;

const gasAndElectric = `<StatCard
                    title="Consumo Gas"
                    value={\`\${stats.gasConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³\`}
                    subtext="Estimado (Secadoras STG)"
                    icon={Flame}
                    color="#F59E0B"
                />
                <StatCard
                    title="Consumo Eléctrico"
                    value={\`\${stats.electricConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW/h\`}
                    subtext="Total estimado"
                    icon={Zap}
                    color="#eab308"
                />
            </div>`;

content = content.replace(gasCard, gasAndElectric);

fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Step 2 complete: Updated global calculations and stat card');
