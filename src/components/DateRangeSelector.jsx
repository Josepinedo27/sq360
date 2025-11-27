import React from 'react';
import { Calendar } from 'lucide-react';

const DateRangeSelector = ({ startDate, endDate, onRangeChange }) => {
    const handleStartDateChange = (e) => {
        const newStart = new Date(e.target.value);
        // If new start is after end, push end to start
        if (newStart > endDate) {
            onRangeChange(newStart, newStart);
        } else {
            onRangeChange(newStart, endDate);
        }
    };

    const handleEndDateChange = (e) => {
        const newEnd = new Date(e.target.value);
        // If new end is before start, pull start to end
        if (newEnd < startDate) {
            onRangeChange(newEnd, newEnd);
        } else {
            onRangeChange(startDate, newEnd);
        }
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="date-range-selector">
            <div className="date-input-group">
                <Calendar size={16} className="date-icon" />
                <input
                    type="date"
                    value={formatDateForInput(startDate)}
                    onChange={handleStartDateChange}
                    className="date-input"
                    aria-label="Fecha de inicio"
                />
                <span className="date-separator">to</span>
                <input
                    type="date"
                    value={formatDateForInput(endDate)}
                    onChange={handleEndDateChange}
                    className="date-input"
                    aria-label="Fecha de fin"
                />
            </div>
            <style jsx>{`
                .date-range-selector {
                    display: flex;
                    align-items: center;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 4px 12px;
                }
                .date-input-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .date-icon {
                    color: var(--text-secondary);
                }
                .date-input {
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    font-family: inherit;
                    font-size: 0.9rem;
                    padding: 4px;
                    outline: none;
                }
                .date-input::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
                .date-separator {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
            `}</style>
        </div>
    );
};

export default DateRangeSelector;
