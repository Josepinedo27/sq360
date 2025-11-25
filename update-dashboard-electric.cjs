const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/components/Dashboard.jsx', 'utf8');

// 1. Add Zap to imports
content = content.replace(
    "import { MapPin, DollarSign, RefreshCw, Activity, Droplets, Flame } from 'lucide-react';",
    "import { MapPin, DollarSign, RefreshCw, Activity, Droplets, Flame, Zap } from 'lucide-react';"
);

// 2. Add electricConsumption to state
content = content.replace(
    `const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0
    });`,
    `const [stats, setStats] = useState({
        locations: 0,
        revenue: 0,
        totalCycles: 0,
        avgCyclesPerMachine: 0,
        avgDailyCycles: 0,
        waterConsumption: 0,
        gasConsumption: 0,
        electricConsumption: 0
    });`
);

// 3. Add electricConsumption to locationMap initialization
content = content.replace(
    `locationMap[loc.id] = {
                locationId: loc.id,
                locationName: loc.name,
                totalRevenue: 0,
                prevTotalRevenue: 0,
                machineCount: 0,
                machines: new Set(),
                waterConsumption: 0,
                gasConsumption: 0,
                totalCycles: 0
            };`,
    `locationMap[loc.id] = {
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
            };`
);

// 4. Replace the consumption calculation logic - THIS IS THE BIG ONE
const oldLogic = `loc.machines.forEach(m => {
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

const newLogic = `loc.machines.forEach(m => {
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

content = content.replace(oldLogic, newLogic);

// 5. Update the variable declarations in the cycle processing
content = content.replace(
    `let washerCycles = 0;
                    let dryerCycles = 0;
                    let totalCycles = 0;`,
    `let waterConsumption = 0;
                    let gasConsumption = 0;
                    let electricConsumption = 0;
                    let totalCycles = 0;`
);

// 6. Add electricConsumption to the return statement
content = content.replace(
    `return Object.values(locationMap).map(loc => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
            totalRevenue: loc.totalRevenue,
            prevTotalRevenue: loc.prevTotalRevenue,
            machineCount: loc.machines.size,
            waterConsumption: loc.waterConsumption,
            gasConsumption: loc.gasConsumption,
            totalCycles: loc.totalCycles
        }));`,
    `return Object.values(locationMap).map(loc => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
            totalRevenue: loc.totalRevenue,
            prevTotalRevenue: loc.prevTotalRevenue,
            machineCount: loc.machines.size,
            waterConsumption: loc.waterConsumption,
            gasConsumption: loc.gasConsumption,
            electricConsumption: loc.electricConsumption,
            totalCycles: loc.totalCycles
        }));`
);

// Write back
fs.writeFileSync('src/components/Dashboard.jsx', content, 'utf8');

console.log('Successfully updated Dashboard.jsx with electric consumption!');
