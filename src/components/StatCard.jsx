import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color, details }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="card" style={{ transition: 'all 0.3s ease' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {Icon && <Icon size={20} color={color || 'var(--accent-color)'} />}
                    <span>{title}</span>
                </div>
                {details && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>
            <div className="card-value">{value}</div>
            {subtext && <div className="card-subtext">{subtext}</div>}

            {isExpanded && details && (
                <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--glass-border)',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    {details.map((item, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)'
                        }}>
                            <span>{item.label}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatCard;
