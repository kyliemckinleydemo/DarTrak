import React, { useState, useMemo } from 'react';

interface DatePickerProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth()));

    const daysInMonth = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }, [currentMonth]);

    const firstDayOfMonth = useMemo(() => {
        return currentMonth.getDay();
    }, [currentMonth]);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(currentMonth);
        newDate.setDate(day);
        // Preserve time from original selectedDate
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
        newDate.setSeconds(0, 0);
        onChange(newDate);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [hours, minutes] = e.target.value.split(':').map(Number);
        const newDate = new Date(selectedDate);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        onChange(newDate);
    };

    const today = new Date();
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-md p-3 text-white w-full">
            <div className="flex justify-between items-center mb-3">
                <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700">&lt;</button>
                <div className="font-semibold text-center">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {daysInMonth.map(day => {
                    const isSelected = selectedDate.toDateString() === day.toDateString();
                    const isToday = today.toDateString() === day.toDateString();
                    
                    let className = "w-full h-8 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors ";
                    if (isSelected) {
                        className += "bg-indigo-600 text-white font-bold";
                    } else if (isToday) {
                        className += "bg-gray-700 text-white";
                    } else {
                        className += "hover:bg-gray-700";
                    }

                    return (
                        <button type="button" key={day.toISOString()} onClick={() => handleDateClick(day.getDate())} className={className}>
                            {day.getDate()}
                        </button>
                    );
                })}
            </div>
            <div className="border-t border-gray-700 mt-3 pt-3">
                 <input
                    type="time"
                    value={`${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}`}
                    onChange={handleTimeChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
        </div>
    );
};

export default DatePicker;