
import React, { useState, useEffect } from 'react';
import { Task, TaskType, Course } from '../types';
import DatePicker from './DatePicker';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<Task, 'id' | 'completed' | 'source' | 'user_id'>) => void;
  courses: Course[];
  initialTask?: Partial<Omit<Task, 'user_id'>> | null;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ isOpen, onClose, onSaveTask, courses, initialTask }) => {
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [type, setType] = useState<TaskType>(TaskType.Assignment);
  
  const isEditing = !!initialTask?.id;

  useEffect(() => {
    if (isOpen) {
        setTitle(initialTask?.title || '');
        setCourse(initialTask?.course || (courses.length > 0 ? courses[0].name : ''));
        setDueDate(initialTask?.due_date ? new Date(initialTask.due_date) : new Date());
        setType(initialTask?.type || TaskType.Assignment);
    }
  }, [initialTask, isOpen, courses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !course || !dueDate) return;
    onSaveTask({
      title,
      course,
      due_date: dueDate.toISOString(),
      type,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Task' : 'Add New Task'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-300">Course</label>
            <select
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
              className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>Select a course</option>
              {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
            <DatePicker selectedDate={dueDate} onChange={setDueDate} />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {Object.values(TaskType).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-gray-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-indigo-500">
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;