import re

# Read the file
with open('src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the section with getMachines calls
old_section = '''const machinesPromises = locations.map(loc => getMachines(loc.id));
            const machinesResults = await Promise.all(machinesPromises);

            let totalMachines = 0;
            machinesResults.forEach(result => {
                const machines = result?.items || result?.data || (Array.isArray(result) ? result : []);
                totalMachines += machines.length;
            });

            const revenueList = revenueData?.data?.locations || [];
            const prevRevenueList = prevRevenueData?.data?.locations || [];
            const cycleList = cycleData?.data?.locations || [];'''

new_section = '''const revenueList = revenueData?.data?.locations || [];
            const prevRevenueList = prevRevenueData?.data?.locations || [];
            const cycleList = cycleData?.data?.locations || [];

            // Calculate total machines from revenue data
            let totalMachines = 0;
            revenueList.forEach(loc => {
                if (loc.machines && Array.isArray(loc.machines)) {
                    totalMachines += loc.machines.length;
                }
            });'''

content = content.replace(old_section, new_section)

# Write back
with open('src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed Dashboard.jsx successfully")
