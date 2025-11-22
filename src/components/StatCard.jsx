import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
    return (
        <div className="card">
            <div className="card-header">
                {Icon && <Icon size={20} color={color || 'var(--accent-color)'} />}
                <span>{title}</span>
            </div>
            <div className="card-value">{value}</div>
            {subtext && <div className="card-subtext">{subtext}</div>}
        </div>
    );
};

export default StatCard;
