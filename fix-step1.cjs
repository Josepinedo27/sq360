const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// 1. Add electricConsumption to state
const oldState = `const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0
    });`;

const newState = `const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0,
        electricConsumption: 0
    });`;

content = content.replace(oldState, newState);

// 2. Add electricConsumption to locationMap initialization
const oldLocationMap = `locationMap[loc.id] = {
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
            };`;

// Check if already has electricConsumption
if (!content.includes('electricConsumption: 0,\n                totalCycles: 0')) {
    const oldMap = `locationMap[loc.id] = {
                locationId: loc.id,
                locationName: loc.name,
                totalRevenue: 0,
                prevTotalRevenue: 0,
                machineCount: 0,
                machines: new Set(),
                waterConsumption: 0,
                gasConsumption: 0,
                totalCycles: 0
            };`;

    content = content.replace(oldMap, oldLocationMap);
}

// 3 & 4. Replace consumption logic in processRevenueByLocation
const oldLogic = `loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;
                        const model = (m.model || '').toUpperCase();

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
                    locationMap[loc.id].totalCycles = totalCycles;`;

// Check if logic hasn't been updated yet
if (content.includes('Extract node number from name')) {
    const currentLogic = `loc.machines.forEach(m => {
                        const cycles = parseInt(m.totalCycles || 0, 10);
                        totalCycles += cycles;

                        // Extract node number from name
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

                    locationMap[loc.id].waterConsumption = washerCycles * 77;
                    locationMap[loc.id].gasConsumption = dryerCycles * 0.39;
                    locationMap[loc.id].totalCycles = totalCycles;`;

    content = content.replace(currentLogic, oldLogic);

    // Also need to update variable declarations
    content = content.replace(
        `let washerCycles = 0;
                    let dryerCycles = 0;
                    let totalCycles = 0;`,
        `let waterConsumption = 0;
                    let gasConsumption = 0;
                    let electricConsumption = 0;
                    let totalCycles = 0;`
    );
}

fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');
console.log('Step 1 complete: Updated processRevenueByLocation');
