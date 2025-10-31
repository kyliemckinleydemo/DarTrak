
import React, { useState } from 'react';
import { Task, Course, View } from '../types';
import Icon from './Icon';
import TaskEditModal from './TaskEditModal';

const SOURCE_STYLES: Record<Task['source'], string> = {
    email: 'bg-green-600',
    canvas: 'bg-red-600',
    manual: 'bg-indigo-600',
};

interface PendingTaskItemProps {
    task: Omit<Task, 'user_id'>; // user_id not needed for display
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    onEdit: (task: Omit<Task, 'user_id'>) => void;
}

const PendingTaskItem: React.FC<PendingTaskItemProps> = ({ task, onAccept, onReject, onEdit }) => {
    const { id, title, course, due_date, source } = task;
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

    return (
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-100">{title}</p>
                    <div className="text-sm text-gray-400 mt-1 flex items-center flex-wrap gap-x-3 gap-y-1">
                        <span>{course}</span>
                        <span className="font-mono">{formattedDate} at {formattedTime}</span>
                    </div>
                </div>
                 <span className={`w-2.5 h-2.5 rounded-full ml-3 flex-shrink-0 mt-1 ${SOURCE_STYLES[source]}`} title={`Source: ${source}`}></span>
            </div>
            <div className="flex items-center justify-end space-x-2">
                 <button onClick={() => onReject(id)} className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                    <Icon name="x-mark" className="w-5 h-5" />
                </button>
                <button onClick={() => onEdit(task)} className="p-2 rounded-full text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors">
                    <Icon name="pencil" className="w-5 h-5" />
                </button>
                <button onClick={() => onAccept(id)} className="p-2 rounded-full text-gray-400 hover:bg-green-500/20 hover:text-green-400 transition-colors">
                    <Icon name="check" className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};


interface InboxViewProps {
    pendingTasks: Task[];
    courses: Course[];
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    onUpdateAndAccept: (id: string, updatedTask: Omit<Task, 'id' | 'completed' | 'source' | 'user_id'>) => void;
    onAcceptAll: () => void;
    onRejectAll: () => void;
    onNavigate: (view: View) => void;
}

const InboxView: React.FC<InboxViewProps> = ({ pendingTasks, courses, onAccept, onReject, onUpdateAndAccept, onAcceptAll, onRejectAll, onNavigate }) => {
    const [editingTask, setEditingTask] = useState<Omit<Task, 'user_id'> | null>(null);

    const handleSaveEdit = (updatedTask: Omit<Task, 'id' | 'completed'| 'source' | 'user_id'>) => {
        if (editingTask) {
            onUpdateAndAccept(editingTask.id, updatedTask);
        }
        setEditingTask(null);
    };

    const handleAcceptAll = () => {
        onAcceptAll();
        onNavigate('home');
    };

    if (pendingTasks.length === 0) {
        return (
             <div className="text-center p-8 text-gray-400">
                <Icon name="inbox" className="w-12 h-12 mx-auto text-gray-500"/>
                <h2 className="mt-4 text-xl font-bold text-white">Inbox Zero</h2>
                <p className="mt-1">All new tasks have been reviewed. Sync to find more!</p>
            </div>
        );
    }
    
    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 bg-gray-800 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-300">{pendingTasks.length} new tasks to review</p>
                <div className="flex items-center space-x-2">
                    <button onClick={onRejectAll} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600">Reject All</button>
                    <button onClick={handleAcceptAll} className="px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">Accept All</button>
                </div>
            </div>
            <div className="space-y-3">
                {pendingTasks.map(task => (
                    <PendingTaskItem
                        key={task.id}
                        task={task}
                        onAccept={onAccept}
                        onReject={onReject}
                        onEdit={setEditingTask}
                    />
                ))}
            </div>

            <TaskEditModal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                onSaveTask={handleSaveEdit}
                courses={courses}
                initialTask={editingTask}
            />
        </div>
    );
};

export default InboxView;