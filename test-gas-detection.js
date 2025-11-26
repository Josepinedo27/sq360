// Test script to verify gas detection logic
const testMachines = [
    { name: 'Secadora 1', model: 'STGNXASP115TW01', totalCycles: 50 },
    { name: 'Lavadora 2', model: 'SFNNCRSP125TW01', totalCycles: 100 },
    { name: 'Secadora 3', model: 'STENXASP115TW01', totalCycles: 45 },
    { name: 'Lavadora 4', model: 'AFNNCRSP125TW01', totalCycles: 95 },
    { name: 'Secadora 5', model: 'STLNXASP115TW01', totalCycles: 40 }, // Propane
];

let totalGas = 0;
let totalWater = 0;
let totalElectric = 0;

console.log('\\n=== Testing Gas Detection Logic ===\\n');

testMachines.forEach((m, index) => {
    const cycles = parseInt(m.totalCycles || 0, 10);
    const model = (m.model || '').toUpperCase();
    const machineNumber = index + 1;

    console.log(`Machine #${machineNumber}: ${m.name}`);
    console.log(`  Model: ${model}`);
    console.log(`  Char at position 2: '${model.charAt(2)}'`);
    console.log(`  Cycles: ${cycles}`);

    // Detect dryer type
    if (model.charAt(2) === 'G' || model.charAt(2) === 'L') {
        const gasAdded = cycles * 0.39;
        totalGas += gasAdded;
        totalElectric += cycles * 0.19;
        console.log(`  ✓ GAS DRYER: Added ${gasAdded.toFixed(2)} m³ gas, ${(cycles * 0.19).toFixed(2)} kW/h electric`);
    } else if (model.charAt(2) === 'E') {
        totalElectric += cycles * 4.5;
        console.log(`  ⚡ ELECTRIC DRYER: Added ${(cycles * 4.5).toFixed(2)} kW/h electric`);
    }

    // Water for washers (even numbers)
    if (machineNumber % 2 === 0) {
        totalWater += cycles * 77;
        totalElectric += cycles * 0.35;
        console.log(`  💧 WASHER: Added ${(cycles * 77).toFixed(0)} L water, ${(cycles * 0.35).toFixed(2)} kW/h electric`);
    }

    console.log('');
});

console.log('\\n=== FINAL TOTALS ===');
console.log(`Gas: ${totalGas.toFixed(2)} m³`);
console.log(`Water: ${totalWater.toLocaleString()} L`);
console.log(`Electric: ${totalElectric.toFixed(2)} kW/h`);
console.log('');
