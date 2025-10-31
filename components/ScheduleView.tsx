import React, { useState } from 'react';
import { Course } from '../types';
import Icon from './Icon';

interface ScheduleViewProps {
  courses: Course[];
  // FIX: The onAddCourse prop should not expect a 'user_id' as it is handled by the backend. Omit 'user_id' to align with the 'addCourse' function from the useTaskManager hook.
  onAddCourse: (course: Omit<Course, 'id' | 'user_id'>) => void;
  onDeleteCourse: (id: string) => void;
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ScheduleView: React.FC<ScheduleViewProps> = ({ courses, onAddCourse, onDeleteCourse }) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('10:00');
  const [days, setDays] = useState<number[]>([]);

  const toggleDay = (dayIndex: number) => {
    setDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || days.length === 0) return;
    onAddCourse({ name, days, time });
    setName('');
    setTime('10:00');
    setDays([]);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Add New Class</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Class Name (e.g., Psychology 101)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <div className="flex justify-between items-center">
            {weekDays.map((day, index) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(index)}
                className={`w-10 h-10 rounded-full text-sm font-bold transition-colors ${days.includes(index) ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {day.charAt(0)}
              </button>
            ))}
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] text-base">
            <Icon name="add" className="w-5 h-5" />
            Add Class to Schedule
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {courses.length > 0 ? (
          courses.map(course => (
            <div key={course.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{course.name}</p>
                <p className="text-sm text-gray-400">
                  {course.days.sort().map(d => weekDays[d]).join(', ')} at {new Date(`1970-01-01T${course.time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <button onClick={() => onDeleteCourse(course.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                <Icon name="trash" className="w-5 h-5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No classes added yet. Add a class to enable smart prep reminders.</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleView;