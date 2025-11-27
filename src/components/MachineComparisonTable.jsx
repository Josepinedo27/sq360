import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MachineComparisonTable = ({ cycleList, prevCycleList, locations }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'currentCycles', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    // Build comparison data
    const comparisonData = [];

    cycleList.forEach(loc => {
        const locationName = locations.find(l => l.id === loc.id)?.name || 'Unknown';
        const prevLoc = prevCycleList.find(pl => pl.id === loc.id);

        if (loc.machines) {
            loc.machines.forEach((machine, index) => {
                const currentCycles = parseInt(machine.totalCycles || 0, 10);
                const prevMachine = prevLoc?.machines?.[index];
                const prevCycles = parseInt(prevMachine?.totalCycles || 0, 10);
                const delta = currentCycles - prevCycles;
                const percentChange = prevCycles > 0 ? ((delta / prevCycles) * 100) : 0;
                const lifetimeCycles = parseInt(machine.lifetimeCycles || 0, 10);

                comparisonData.push({
                    machineId: machine.id,
                    machineName: machine.name || `M\u00E1quina ${index + 1}`,
                    locationName,
                    currentCycles,
                    prevCycles,
                    delta,
                    percentChange,
                    lifetimeCycles
                });
            });
        }
    });

    // Filter
    const filteredData = comparisonData.filter(item =>
        item.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.locationName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    const sortedData = [...filteredData].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const modifier = sortConfig.direction === 'asc' ? 1 : -1;
        return aVal > bVal ? modifier : aVal < bVal ? -modifier : 0;
    });

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getTrendIcon = (delta) => {
        if (delta > 0) return <TrendingUp size={16} color="#10B981" />;
        if (delta < 0) return <TrendingDown size={16} color="#EF4444" />;
        return <Minus size={16} color="#6B7280" />;
    };

    return (
        <div className="comparison-container">
            <div className="comparison-header">
                <h2>Comparaci\u00F3n Mensual por Equipo</h2>
                <input
                    type="text"
                    placeholder="Buscar m\u00E1quina o ubicaci\u00F3n..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="table-container">
                <table className="comparison-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('machineName')}>M\u00E1quina</th>
                            <th onClick={() => handleSort('locationName')}>Ubicaci\u00F3n</th>
                            <th onClick={() => handleSort('currentCycles')}>Per\u00EDodo Actual</th>
                            <th onClick={() => handleSort('prevCycles')}>Per\u00EDodo Anterior</th>
                            <th onClick={() => handleSort('delta')}>Diferencia</th>
                            <th onClick={() => handleSort('percentChange')}>% Cambio</th>
                            <th onClick={() => handleSort('lifetimeCycles')}>Lifetime Cycles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((item, index) => (
                            <tr key={`${item.machineId}-${index}`}>
                                <td>{item.machineName}</td>
                                <td>{item.locationName}</td>
                                <td>{item.currentCycles.toLocaleString()}</td>
                                <td>{item.prevCycles.toLocaleString()}</td>
                                <td className="delta-cell">
                                    {getTrendIcon(item.delta)}
                                    <span className={item.delta > 0 ? 'positive' : item.delta < 0 ? 'negative' : ''}>
                                        {item.delta > 0 ? '+' : ''}{item.delta.toLocaleString()}
                                    </span>
                                </td>
                                <td className={item.percentChange > 0 ? 'positive' : item.percentChange < 0 ? 'negative' : ''}>
                                    {item.percentChange > 0 ? '+' : ''}{item.percentChange.toFixed(1)}%
                                </td>
                                <td style={{ fontWeight: '600', color: '#60A5FA' }}>
                                    {item.lifetimeCycles.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .comparison-container {
                    width: 100%;
                    background: var(--card-bg);
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-top: 2rem;
                }

                .comparison-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .comparison-header h2 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: 1.5rem;
                }

                .search-input {
                    padding: 0.5rem 1rem;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    min-width: 250px;
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--accent-color);
                }

                .table-container {
                    overflow-x: auto;
                }

                .comparison-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .comparison-table thead th {
                    background: var(--bg-secondary);
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                    user-select: none;
                    border-bottom: 2px solid var(--border-color);
                }

                .comparison-table thead th:hover {
                    background: var(--bg-hover);
                }

                .comparison-table tbody tr {
                    border-bottom: 1px solid var(--border-color);
                    transition: background 0.2s;
                }

                .comparison-table tbody tr:hover {
                    background: var(--bg-hover);
                }

                .comparison-table tbody td {
                    padding: 1rem;
                    color: var(--text-primary);
                }

                .delta-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .positive {
                    color: #10B981;
                    font-weight: 600;
                }

                .negative {
                    color: #EF4444;
                    font-weight: 600;
                }

                @media (max-width: 768px) {
                    .comparison-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .search-input {
                        min-width: 100%;
                    }

                    .comparison-table {
                        font-size: 0.85rem;
                    }

                    .comparison-table thead th,
                    .comparison-table tbody td {
                        padding: 0.75rem 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default MachineComparisonTable;
