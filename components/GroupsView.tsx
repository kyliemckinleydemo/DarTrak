
import React from 'react';
import { Task, View } from '../types';
import TaskItem from './TaskItem';
import Icon from './Icon';

interface DashboardViewProps {
    tasks: Task[];
    onToggleCompleted: (id: string) => void;
    onSnoozeTask: (id: string, duration: '1d' | '2d' | '1w') => void;
    onDeleteTask: (id: string) => void;
    onNavigate: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, onToggleCompleted, onSnoozeTask, onDeleteTask, onNavigate }) => {
    const now = new Date();
    const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const overdueTasks = tasks
        .filter(task => !task.completed && new Date(task.due_date) < now)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    const dueSoonTasks = tasks
        .filter(task => !task.completed && new Date(task.due_date) >= now && new Date(task.due_date) <= fortyEightHoursFromNow)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    return (
        <div className="space-y-6 p-4">
            {/* Overdue Section */}
            <div>
                <h2 className="text-lg font-semibold text-red-400 mb-2">Overdue</h2>
                {overdueTasks.length > 0 ? (
                    <div className="space-y-2">
                        {overdueTasks.map(task => (
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
                    <div className="text-center p-6 text-gray-500 bg-gray-800 rounded-lg">
                        <p>No overdue tasks. Great job!</p>
                    </div>
                )}
            </div>

            {/* Due Soon Section */}
            <div>
                <h2 className="text-lg font-semibold text-indigo-300 mb-2">Due Soon (Next 48 Hours)</h2>
                {dueSoonTasks.length > 0 ? (
                    <div className="space-y-2">
                        {dueSoonTasks.map(task => (
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
                    <div className="text-center p-6 text-gray-500 bg-gray-800 rounded-lg">
                        <p>Nothing due in the next 48 hours.</p>
                    </div>
                )}
            </div>

            <div className="pt-4">
                <button
                    onClick={() => onNavigate('tasks')}
                    className="w-full text-center px-4 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    View All {tasks.filter(t => !t.completed).length} Tasks
                </button>
            </div>
        </div>
    );
};

export default DashboardView;