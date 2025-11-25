const fs = require('fs');

let content = fs.readFileSync('src/components/LocationRevenueTable.jsx', 'utf8');

// 1. Add Zap import
content = content.replace(
    "import { MapPin, TrendingUp, Search, Activity, Droplets, Flame } from 'lucide-react';",
    "import { MapPin, TrendingUp, Search, Activity, Droplets, Flame, Zap } from 'lucide-react';"
);

// 2. Update sortBy comment
content = content.replace(
    "const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'name' | 'machines' | 'cycles' | 'water' | 'gas'",
    "const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'name' | 'machines' | 'cycles' | 'water' | 'gas' | 'electric'"
);

// 3. Add electric sorting
content = content.replace(
    `case 'gas':
                    comparison = a.gasConsumption - b.gasConsumption;
                    break;
                default:
                    comparison = 0;`,
    `case 'gas':
                    comparison = a.gasConsumption - b.gasConsumption;
                    break;
                case 'electric':
                    comparison = a.electricConsumption - b.electricConsumption;
                    break;
                default:
                    comparison = 0;`
);

// 4. Add electric header
content = content.replace(
    `<th onClick={() => handleSort('gas')} className="sortable">
                                Gas (m³) {sortBy === 'gas' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>% del Total</th>`,
    `<th onClick={() => handleSort('gas')} className="sortable">
                                Gas (m³) {sortBy === 'gas' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('electric')} className="sortable">
                                Electricidad (kW/h) {sortBy === 'electric' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>% del Total</th>`
);

// 5. Add electric data cell
content = content.replace(
    `<td className="consumption">
                                    {(location.gasConsumption || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="percentage">`,
    `<td className="consumption">
                                    {(location.gasConsumption || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="consumption">
                                    {(location.electricConsumption || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="percentage">`
);

// 6. Update colSpan
content = content.replace('<td colSpan="8">', '<td colSpan="9">');

// 7. Add electric to detail panel
content = content.replace(
    `<div className="detail-item">
                                                    <Flame size={20} />
                                                    <span className="detail-label">Consumo Gas</span>
                                                    <span className="detail-value">
                                                        {(location.gasConsumption || 0).toLocaleString(undefined, { 
                                                            minimumFractionDigits: 2, 
                                                            maximumFractionDigits: 2 
                                                        })} m³
                                                    </span>
                                                </div>
                                            </div>
                                        </div>`,
    `<div className="detail-item">
                                                    <Flame size={20} />
                                                    <span className="detail-label">Consumo Gas</span>
                                                    <span className="detail-value">
                                                        {(location.gasConsumption || 0).toLocaleString(undefined, { 
                                                            minimumFractionDigits: 2, 
                                                            maximumFractionDigits: 2 
                                                        })} m³
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <Zap size={20} />
                                                    <span className="detail-label">Consumo Eléctrico</span>
                                                    <span className="detail-value">
                                                        {(location.electricConsumption || 0).toLocaleString(undefined, { 
                                                            minimumFractionDigits: 2, 
                                                            maximumFractionDigits: 2 
                                                        })} kW/h
                                                    </span>
                                                </div>
                                            </div>
                                        </div>`
);

fs.writeFileSync('src/components/LocationRevenueTable.jsx', content, 'utf8');
console.log('Step 3 complete: Updated LocationRevenueTable');
