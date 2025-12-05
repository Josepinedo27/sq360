import React, { useState, useMemo } from 'react';
import { MapPin, TrendingUp, Search, Activity, Droplets, Flame, Zap, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const LocationRevenueTable = ({ locationRevenue, loading, user }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'totalRevenue', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState(new Set());

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

    const toggleRow = (locationId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(locationId)) {
            newExpanded.delete(locationId);
        } else {
            newExpanded.add(locationId);
        }
        setExpandedRows(newExpanded);
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
                            <th style={{ width: '40px' }}></th>
                            <th onClick={() => requestSort('locationName')}>Locación</th>
                            {user?.role === 'admin' && (
                                <th onClick={() => requestSort('totalRevenue')}>Revenue</th>
                            )}
                            <th onClick={() => requestSort('totalCycles')}>Ciclos</th>
                            <th onClick={() => requestSort('totalUtilityCost')}>Total Servicios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((location) => (
                            <React.Fragment key={location.locationId}>
                                <tr
                                    className={`location-row ${expandedRows.has(location.locationId) ? 'expanded' : ''}`}
                                    onClick={() => toggleRow(location.locationId)}
                                >
                                    <td className="expand-cell">
                                        {expandedRows.has(location.locationId) ?
                                            <ChevronUp size={16} /> :
                                            <ChevronDown size={16} />
                                        }
                                    </td>
                                    <td className="location-cell">
                                        <div className="location-icon">
                                            <MapPin size={16} color="#fff" />
                                        </div>
                                        <span className="location-name">{location.locationName}</span>
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="revenue-cell">
                                            ${location.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    )}
                                    <td>
                                        <div className="cycles-cell">
                                            <Activity size={14} color="#6B7280" />
                                            {location.totalCycles.toLocaleString()}
                                        </div>
                                    </td>
                                    {/* Costs moved to details */}
                                    <td className="total-cost-cell">
                                        <div style={{ fontWeight: 600, color: '#EF4444' }}>
                                            ${(location.totalUtilityCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </td>
                                </tr>
                                {expandedRows.has(location.locationId) && (
                                    <tr className="details-row">
                                        <td colSpan="5">
                                            <div className="details-container">
                                                <div className="utility-breakdown" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem' }}>
                                                    <h4 style={{ marginBottom: '1rem', color: '#374151', fontSize: '0.9rem', fontWeight: 600 }}>Desglose de Servicios</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                        {/* Water Breakdown */}
                                                        <div className="utility-card">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                <Droplets size={16} color="#0EA5E9" />
                                                                <span style={{ fontWeight: 500, color: '#374151' }}>Agua</span>
                                                            </div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0EA5E9' }}>
                                                                ${(location.waterCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                                                Consumo: {(location.waterConsumption || 0).toLocaleString()} L
                                                            </div>
                                                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #E5E7EB', fontSize: '0.8rem' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                    <span style={{ color: '#6B7280' }}>Acueducto:</span>
                                                                    <span style={{ fontWeight: 500 }}>${(location.aqueductCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                                                    <span style={{ color: '#6B7280' }}>Alcantarillado:</span>
                                                                    <span style={{ fontWeight: 500 }}>${(location.sewageCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Gas Breakdown */}
                                                        <div className="utility-card">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                <Flame size={16} color="#F59E0B" />
                                                                <span style={{ fontWeight: 500, color: '#374151' }}>Gas</span>
                                                            </div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F59E0B' }}>
                                                                ${(location.gasCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                                                Consumo: {(location.gasConsumption || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} m³
                                                            </div>
                                                        </div>

                                                        {/* Electricity Breakdown */}
                                                        <div className="utility-card">
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                <Zap size={16} color="#EAB308" />
                                                                <span style={{ fontWeight: 500, color: '#374151' }}>Energía</span>
                                                            </div>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#EAB308' }}>
                                                                ${(location.electricityCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </div>
                                                            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                                                                Consumo: {(location.electricityConsumption || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <h4>Detalle por Máquina {user?.role === 'admin' ? '(Revenue)' : ''}</h4>
                                                <div className="machines-grid">
                                                    {location.machineDetails && location.machineDetails.length > 0 ? (
                                                        location.machineDetails.map(machine => (
                                                            <div key={machine.id} className="machine-item">
                                                                <div className="machine-info">
                                                                    <span className="machine-name">{machine.name}</span>
                                                                    <span className="machine-type">{machine.type}</span>
                                                                </div>
                                                                <div className="machine-stats">
                                                                    {user?.role === 'admin' && (
                                                                        <span className="machine-revenue">
                                                                            ${machine.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                        </span>
                                                                    )}
                                                                    <span className="machine-cycles" title="Ciclos Totales">
                                                                        <RefreshCw size={12} />
                                                                        {(machine.totalCycles || 0).toLocaleString()}
                                                                    </span>
                                                                    <span className="machine-avg-daily" title="Promedio ciclos por día">
                                                                        <Activity size={12} />
                                                                        {(machine.avgDailyCycles || 0).toFixed(1)}/día
                                                                    </span>
                                                                    <div className="progress-bar-container">
                                                                        <div
                                                                            className="progress-bar"
                                                                            style={{ width: `${Math.min(machine.percentage, 100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="machine-percentage">
                                                                        {machine.percentage.toFixed(1)}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="no-details">No hay detalles disponibles</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
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

                .location-row {
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .location-row:hover {
                    background-color: var(--bg-hover);
                }
                
                .location-row.expanded {
                    background-color: var(--bg-secondary);
                }

                .expand-cell {
                    color: var(--text-secondary);
                    text-align: center;
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

                .cost-cell {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 2px;
                }

                .total-cost-cell {
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                    text-align: right;
                }

                /* Details Row Styles */
                .details-row td {
                    padding: 0;
                    border-bottom: 1px solid var(--border-color);
                    background-color: var(--bg-secondary);
                }

                .details-container {
                    padding: 1.5rem;
                    border-left: 4px solid var(--accent-color);
                }

                .details-container h4 {
                    margin: 0 0 1rem 0;
                    font-size: 1rem;
                    color: var(--text-secondary);
                }

                .machines-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                }

                .machine-item {
                    background: var(--bg-primary);
                    padding: 1rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .machine-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .machine-name {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .machine-type {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    background: var(--bg-hover);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }

                .machine-stats {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .machine-revenue {
                    font-weight: 600;
                    min-width: 80px;
                }

                .machine-cycles {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    color: var(--text-primary);
                    background: var(--bg-hover);
                    padding: 2px 6px;
                    border-radius: 4px;
                    white-space: nowrap;
                    font-weight: 500;
                }

                .machine-avg-daily {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    background: var(--bg-secondary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    white-space: nowrap;
                }

                .progress-bar-container {
                    flex: 1;
                    height: 6px;
                    background: var(--bg-hover);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: var(--accent-color);
                    border-radius: 3px;
                }

                .machine-percentage {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    min-width: 45px;
                    text-align: right;
                }

                .no-details {
                    color: var(--text-secondary);
                    font-style: italic;
                }

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
                    
                    .machines-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default LocationRevenueTable;
