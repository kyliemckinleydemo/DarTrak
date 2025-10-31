
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskType } from '../types';
import Icon from './Icon';

const TASK_TYPE_STYLES: Record<TaskType, string> = {
    [TaskType.Assignment]: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
    [TaskType.Prep]: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
    [TaskType.Reading]: 'border-green-500/50 bg-green-500/10 text-green-300',
    [TaskType.Study]: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
    [TaskType.Quiz]: 'border-red-500/50 bg-red-500/10 text-red-300',
    [TaskType.Other]: 'border-gray-500/50 bg-gray-500/10 text-gray-300',
};

const SOURCE_STYLES: Record<Task['source'], string> = {
    email: 'bg-green-600',
    canvas: 'bg-red-600',
    manual: 'bg-indigo-600',
};

interface TaskItemProps {
  task: Task;
  onToggleCompleted: (id: string) => void;
  onSnooze: (id: string, duration: '1d' | '2d' | '1w') => void;
  onDelete: (id: string) => void;
}

// A global reference to the currently open menu's close function
let openMenuCloseFunction: (() => void) | null = null;

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleCompleted, onSnooze, onDelete }) => {
  const { id, title, course, due_date, type, completed, source } = task;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSnoozeMenuOpen, setIsSnoozeMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const snoozeMenuRef = useRef<HTMLDivElement>(null);
  
  const dueDateObj = new Date(due_date);

  const formattedDate = dueDateObj.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dueDateObj.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const isPastDue = !completed && dueDateObj < new Date();

  const handleAddToCalendar = () => {
    const startTime = dueDateObj.toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = new Date(dueDateObj.getTime() + 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, ''); // Assume 1 hour duration
    const description = `Course: ${course}\n\n🔔 Set your reminders for 48h, 24h, and 8h before the due date to stay on track!`;
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description)}`;
    window.open(url, '_blank');
    setIsMenuOpen(false);
  };
  
  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsSnoozeMenuOpen(false);
  };

  const toggleMenu = (menu: 'main' | 'snooze') => {
    // If another menu is open, close it first.
    if (openMenuCloseFunction && openMenuCloseFunction !== closeAllMenus) {
        openMenuCloseFunction();
    }
    
    if (menu === 'main') {
        const currentlyOpen = isMenuOpen;
        closeAllMenus();
        setIsMenuOpen(!currentlyOpen);
        openMenuCloseFunction = currentlyOpen ? null : closeAllMenus;
    } else if (menu === 'snooze') {
        const currentlyOpen = isSnoozeMenuOpen;
        closeAllMenus();
        setIsSnoozeMenuOpen(!currentlyOpen);
        openMenuCloseFunction = currentlyOpen ? null : closeAllMenus;
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            menuRef.current && !menuRef.current.contains(event.target as Node) &&
            snoozeMenuRef.current && !snoozeMenuRef.current.contains(event.target as Node)
        ) {
            closeAllMenus();
            openMenuCloseFunction = null;
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`
      flex items-start p-4 space-x-4 rounded-lg
      transition-all duration-300 relative
      ${completed ? 'bg-gray-800/50 opacity-60' : 'bg-gray-800 hover:bg-gray-700/50'}
      ${isPastDue ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-600'}
    `}>
      <div className="flex-shrink-0 pt-1">
        <input
          type="checkbox"
          checked={completed}
          onChange={() => onToggleCompleted(id)}
          className="h-5 w-5 rounded border-gray-600 bg-gray-900 text-indigo-500 focus:ring-indigo-600 cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold ${completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>{title}</p>
        <div className="text-sm text-gray-400 mt-1 flex items-center flex-wrap gap-x-3 gap-y-1">
          <span>{course}</span>
          <span className="font-mono">{formattedDate} at {formattedTime}</span>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${TASK_TYPE_STYLES[type]}`}>
          {type}
        </span>
         
         <div className="relative" ref={snoozeMenuRef}>
            <button onClick={() => toggleMenu('snooze')} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700">
                <Icon name="snooze" className="w-5 h-5" />
            </button>
            {isSnoozeMenuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10 py-1">
                    <button onClick={() => { onSnooze(id, '1d'); closeAllMenus(); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                        <Icon name="snooze" className="w-4 h-4" /><span>Snooze 1 Day</span>
                    </button>
                    <button onClick={() => { onSnooze(id, '2d'); closeAllMenus(); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                        <Icon name="snooze" className="w-4 h-4" /><span>Snooze 2 Days</span>
                    </button>
                    <button onClick={() => { onSnooze(id, '1w'); closeAllMenus(); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                        <Icon name="snooze" className="w-4 h-4" /><span>Snooze 1 Week</span>
                    </button>
                </div>
            )}
        </div>

        <div className="relative" ref={menuRef}>
            <button onClick={() => toggleMenu('main')} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700">
                <Icon name="ellipsis-vertical" className="w-5 h-5" />
            </button>
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-700 rounded-md shadow-lg z-10 py-1">
                    <button onClick={handleAddToCalendar} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                        <Icon name="calendar" className="w-4 h-4" /><span>Add to Google Calendar</span>
                    </button>
                    <div className="border-t border-gray-600 my-1"></div>
                    <button onClick={() => { onDelete(id); closeAllMenus(); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20">
                       <Icon name="trash" className="w-4 h-4" /> <span>Delete Task</span>
                    </button>
                </div>
            )}
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${SOURCE_STYLES[source]}`} title={`Source: ${source}`}></span>
      </div>
    </div>
  );
};

export default TaskItem;
