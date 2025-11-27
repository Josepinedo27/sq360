import React, { useState, useMemo } from 'react';
import { MapPin, TrendingUp, Search, Activity, Droplets, Flame, Zap } from 'lucide-react';

const LocationRevenueTable = ({ locationRevenue, loading }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'totalRevenue', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');

    const sortedData = useMemo(() => {
        let sortableItems = [...locationRevenue];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [locationRevenue, sortConfig]);

    const filteredData = sortedData.filter(location =>
        location.locationName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    if (loading) {
        return <div className="table-loading">Cargando datos de locaciones...</div>;
    }

    return (
        <div className="table-card">
            <div className="table-header">
                <h2>Desglose por Locación</h2>
                <div className="search-container">
                    <Search size={18} color="#6B7280" />
                    <input
                        type="text"
                        placeholder="Buscar locación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="table-responsive">
                <table className="revenue-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('locationName')}>Locación</th>
                            <th onClick={() => requestSort('totalRevenue')}>Revenue</th>
                            <th onClick={() => requestSort('totalCycles')}>Ciclos</th>
                            <th onClick={() => requestSort('waterConsumption')}>Agua (L)</th>
                            <th onClick={() => requestSort('gasConsumption')}>Gas (m³)</th>
                            <th onClick={() => requestSort('electricityConsumption')}>Elec (kWh)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((location) => (
                            <tr key={location.locationId}>
                                <td className="location-cell">
                                    <div className="location-icon">
                                        <MapPin size={16} color="#fff" />
                                    </div>
                                    <span className="location-name">{location.locationName}</span>
                                </td>
                                <td className="revenue-cell">
                                    ${location.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td>
                                    <div className="cycles-cell">
                                        <Activity size={14} color="#6B7280" />
                                        {location.totalCycles.toLocaleString()}
                                    </div>
                                </td>
                                <td>
                                    <div className="consumption-cell water">
                                        <Droplets size={14} />
                                        {(location.waterConsumption || 0).toLocaleString()}
                                    </div>
                                </td>
                                <td>
                                    <div className="consumption-cell gas">
                                        <Flame size={14} />
                                        {(location.gasConsumption || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </td>
                                <td>
                                    <div className="consumption-cell electricity">
                                        <Zap size={14} />
                                        {(location.electricityConsumption || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredData.length === 0 && (
                <div className="empty-state">
                    <p>No se encontraron locaciones que coincidan con "{searchTerm}"</p>
                </div>
            )}

            <style jsx>{`
                .table-card {
                    background: var(--card-bg);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    margin-bottom: 2rem;
                    border: 1px solid var(--border-color);
                }

                .table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .table-header h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: var(--text-primary);
                }

                .search-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-container svg {
                    position: absolute;
                    left: 12px;
                    pointer-events: none;
                }

                .search-input {
                    padding: 0.5rem 1rem 0.5rem 2.5rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                    width: 250px;
                    transition: all 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--accent-color);
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }

                .table-responsive {
                    overflow-x: auto;
                }

                .revenue-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                .revenue-table th {
                    text-align: left;
                    padding: 1rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                    font-size: 0.85rem;
                    border-bottom: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: color 0.2s;
                    white-space: nowrap;
                }

                .revenue-table th:hover {
                    color: var(--text-primary);
                }

                .revenue-table td {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }

                .revenue-table tr:last-child td {
                    border-bottom: none;
                }

                .location-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .location-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: var(--accent-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .location-name {
                    font-weight: 500;
                }

                .revenue-cell {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .cycles-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                }

                .consumption-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                }

                .consumption-cell.water { color: #0EA5E9; }
                .consumption-cell.gas { color: #F59E0B; }
                .consumption-cell.electricity { color: #EAB308; }

                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-secondary);
                }

                .table-loading {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-secondary);
                }

                @media (max-width: 768px) {
                    .table-header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .search-input {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default LocationRevenueTable;
