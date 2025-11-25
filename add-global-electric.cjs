const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// Replace the global cycle calculation logic (lines ~172-203)
const oldGlobalLogic = `            let totalCycles = 0;
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

const newGlobalLogic = `            let totalCycles = 0;
            let totalWater = 0;
            let totalGas = 0;
            let totalElectric = 0;

            cycleList.forEach(loc => {
                if (loc.machines) {
                    loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;
                        const model = (m.model || '').toUpperCase();

                        // Calculate consumption based on machine type
                        if (model.startsWith('STG')) {
                            // Gas dryer
                            totalGas += cycles * 0.39;
                            totalElectric += cycles * 0.19;
                        } else if (model.startsWith('STE')) {
                            // Electric dryer
                            totalElectric += cycles * 4.5;
                        } else {
                            // Washer
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

content = content.replace(oldGlobalLogic, newGlobalLogic);

// Update setStats to include electricConsumption
content = content.replace(
    `setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption
            });`,
    `setStats({
                locations: locations.length,
                revenue: totalRevenue,
                prevRevenue: prevTotalRevenue,
                totalCycles,
                avgCyclesPerMachine,
                avgDailyCycles,
                waterConsumption,
                gasConsumption,
                electricConsumption
            });`
);

// Add Electric Consumption StatCard after Gas Consumption
const gasCard = `<StatCard
                    title="Consumo Gas"
                    value={\`\${stats.gasConsumption.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³\`}
                    subtext="Estimado (Secadoras)"
                    icon={Flame}
                    color="#F59E0B"
                />
            </div>`;

const gasAndElectricCards = `<StatCard
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

content = content.replace(gasCard, gasAndElectricCards);

// Write back
fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');

console.log('Successfully added global electric consumption calculation and stat card!');
