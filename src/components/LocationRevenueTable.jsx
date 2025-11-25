import React, { useState, useMemo } from 'react';
import { MapPin, TrendingUp, Search } from 'lucide-react';

const LocationRevenueTable = ({ locationRevenue, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'name' | 'machines' | 'cycles' | 'water' | 'gas'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

    const filteredAndSorted = useMemo(() => {
        let filtered = locationRevenue.filter(loc =>
            loc.locationName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'revenue':
                    comparison = a.totalRevenue - b.totalRevenue;
                    break;
                case 'prevRevenue':
                    comparison = a.prevTotalRevenue - b.prevTotalRevenue;
                    break;
                case 'name':
                    comparison = a.locationName.localeCompare(b.locationName);
                    break;
                case 'machines':
                    comparison = a.machineCount - b.machineCount;
                    break;
                case 'cycles':
                    comparison = a.totalCycles - b.totalCycles;
                    break;
                case 'water':
                    comparison = a.waterConsumption - b.waterConsumption;
                    break;
                case 'gas':
                    comparison = a.gasConsumption - b.gasConsumption;
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [locationRevenue, searchTerm, sortBy, sortOrder]);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const totalRevenue = useMemo(() => {
        return locationRevenue.reduce((sum, loc) => sum + loc.totalRevenue, 0);
    }, [locationRevenue]);

    const totalPrevRevenue = useMemo(() => {
        return locationRevenue.reduce((sum, loc) => sum + loc.prevTotalRevenue, 0);
    }, [locationRevenue]);

    if (loading) {
        return (
            <div className="location-revenue-table loading">
                <p>Cargando datos de revenue por locación...</p>
            </div>
        );
    }

    return (
        <div className="location-revenue-table">
            <div className="table-header">
                <h2>Revenue por Locación</h2>
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Buscar locación..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Locaciones:</span>
                    <span className="summary-value">{filteredAndSorted.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Revenue Total:</span>
                    <span className="summary-value">
                        ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Mes Anterior:</span>
                    <span className="summary-value" style={{ color: 'var(--text-secondary)' }}>
                        ${totalPrevRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Locación {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('machines')} className="sortable">
                                Máquinas {sortBy === 'machines' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('revenue')} className="sortable">
                                Revenue {sortBy === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('prevRevenue')} className="sortable">
                                Mes Anterior {sortBy === 'prevRevenue' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('cycles')} className="sortable">
                                Ciclos {sortBy === 'cycles' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('water')} className="sortable">
                                Agua (L) {sortBy === 'water' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('gas')} className="sortable">
                                Gas (m³) {sortBy === 'gas' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>% del Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSorted.map((location, index) => (
                            <tr key={location.locationId}>
                                <td className="location-name">
                                    <MapPin size={16} />
                                    <span>{location.locationName}</span>
                                </td>
                                <td className="machine-count">{location.machineCount}</td>
                                <td className="revenue">
                                    ${location.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="revenue" style={{ color: 'var(--text-secondary)' }}>
                                    ${location.prevTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="cycles">
                                    {location.totalCycles?.toLocaleString() || 0}
                                </td>
                                <td className="consumption">
                                    {location.waterConsumption?.toLocaleString() || 0}
                                </td>
                                <td className="consumption">
                                    {(location.gasConsumption || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="percentage">
                                    {totalRevenue > 0 ? ((location.totalRevenue / totalRevenue) * 100).toFixed(1) : 0}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredAndSorted.length === 0 && (
                <div className="no-results">
                    <p>No se encontraron locaciones que coincidan con "{searchTerm}"</p>
                </div>
            )}
        </div>
    );
};

export default LocationRevenueTable;
