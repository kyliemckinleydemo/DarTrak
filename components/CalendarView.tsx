
import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import Icon from './Icon';

interface CalendarViewProps {
    tasks: Task[];
    onToggleCompleted: (id: string) => void;
    onSnoozeTask: (id: string, duration: '1d' | '2d' | '1w') => void;
    onDeleteTask: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onToggleCompleted, onSnoozeTask, onDeleteTask }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth()));
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const tasksByDate = useMemo(() => {
        const map = new Map<string, { hasUpcoming: boolean; hasOverdue: boolean }>();
        const now = new Date();
        tasks.forEach(task => {
            const dueDate = new Date(task.due_date);
            const dateStr = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).toISOString().split('T')[0];
            const isOverdue = !task.completed && dueDate < now;
            
            const existing = map.get(dateStr) || { hasUpcoming: false, hasOverdue: false };
            if (isOverdue) {
                existing.hasOverdue = true;
            } else if (!task.completed) {
                existing.hasUpcoming = true;
            }
            map.set(dateStr, existing);
        });
        return map;
    }, [tasks]);

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

    const firstDayOfMonth = useMemo(() => currentMonth.getDay(), [currentMonth]);

    const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const selectedDayTasks = useMemo(() => {
        return tasks.filter(task => {
            const dueDate = new Date(task.due_date);
            return dueDate.getFullYear() === selectedDate.getFullYear() &&
                   dueDate.getMonth() === selectedDate.getMonth() &&
                   dueDate.getDate() === selectedDate.getDate();
        }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    }, [selectedDate, tasks]);

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="p-4 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <button type="button" onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700">&lt;</button>
                    <div className="font-semibold text-center text-white">
                        {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </div>
                    <button type="button" onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                    {weekDays.map((day, i) => <div key={i}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                    {daysInMonth.map(day => {
                        const dateStr = new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString().split('T')[0];
                        const dayTasks = tasksByDate.get(dateStr);
                        const isSelected = selectedDate.toDateString() === day.toDateString();
                        const isToday = new Date().toDateString() === day.toDateString();
                        
                        let className = "relative w-full h-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors text-white ";
                        if (isSelected) className += "bg-indigo-600 font-bold";
                        else if (isToday) className += "bg-gray-700/50";
                        else className += "hover:bg-gray-700";

                        return (
                            <button type="button" key={day.toISOString()} onClick={() => setSelectedDate(day)} className={className}>
                                <span>{day.getDate()}</span>
                                <div className="absolute bottom-1 flex space-x-1">
                                    {dayTasks?.hasUpcoming && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
                                    {dayTasks?.hasOverdue && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-300 px-4 mb-2">
                    Tasks for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                {selectedDayTasks.length > 0 ? (
                    <div className="space-y-2">
                        {selectedDayTasks.map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggleCompleted={onToggleCompleted}
                                onSnooze={onSnoozeTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-500 bg-gray-800 rounded-lg">
                        <Icon name="check" className="w-8 h-8 mx-auto mb-2"/>
                        <p>No tasks due on this day.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarView;