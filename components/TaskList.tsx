
import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import Loader from './Loader';

interface TaskListProps {
  tasks: Task[];
  onToggleCompleted: (id: string) => void;
  onSnoozeTask: (id: string, duration: '1d' | '2d' | '1w') => void;
  onDeleteTask: (id: string) => void;
  isLoading: boolean;
  error: string | null;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleCompleted, onSnoozeTask, onDeleteTask, isLoading, error }) => {
  const groupTasksByDate = (tasks: Task[]) => {
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    const groups: { [key: string]: Task[] } = {
      'Past Due': [],
      Today: [],
      Tomorrow: [],
      Upcoming: [],
      Completed: [],
    };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    sortedTasks.forEach(task => {
      if (task.completed) {
        groups.Completed.push(task);
        return;
      }
      
      const dueDate = new Date(task.due_date);
      if (dueDate < today) {
        groups['Past Due'].push(task);
      } else if (dueDate >= today && dueDate < tomorrow) {
        groups.Today.push(task);
      } else if (dueDate >= tomorrow && dueDate < dayAfterTomorrow) {
        groups.Tomorrow.push(task);
      } else {
        groups.Upcoming.push(task);
      }
    });

    return groups;
  };
  
  const groupedTasks = groupTasksByDate(tasks);
  const groupOrder = ['Past Due', 'Today', 'Tomorrow', 'Upcoming', 'Completed'];

  if (isLoading && tasks.length === 0) {
    return <Loader message="Loading your tasks..." />;
  }
  
  if (error) {
    return <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg m-4">{error}</div>;
  }

  if (tasks.length === 0 && !isLoading) {
    return <div className="text-center p-8 text-gray-400">No tasks found. Try syncing or adding one manually!</div>;
  }
  
  return (
    <div className="space-y-6">
      {groupOrder.map(groupName => (
        groupedTasks[groupName].length > 0 && (
          <div key={groupName}>
            <h2 className="text-lg font-semibold text-gray-300 px-4 mb-2">{groupName}</h2>
            <div className="space-y-2">
              {groupedTasks[groupName].map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggleCompleted={onToggleCompleted}
                  onSnooze={onSnoozeTask}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default TaskList;