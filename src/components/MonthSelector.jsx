import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthSelector = ({ selectedDate, onDateChange }) => {
    const handlePreviousMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() - 1);
        onDateChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + 1);
        onDateChange(newDate);
    };

    const formatMonth = (date) => {
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    };

    const isCurrentMonth = () => {
        const now = new Date();
        return selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getFullYear() === now.getFullYear();
    };

    return (
        <div className="month-selector">
            <button
                onClick={handlePreviousMonth}
                className="month-nav-btn"
                aria-label="Mes anterior"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="month-display">
                {formatMonth(selectedDate)}
                {isCurrentMonth() && <span className="current-badge">Actual</span>}
            </div>

            <button
                onClick={handleNextMonth}
                className="month-nav-btn"
                disabled={isCurrentMonth()}
                aria-label="Mes siguiente"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default MonthSelector;
