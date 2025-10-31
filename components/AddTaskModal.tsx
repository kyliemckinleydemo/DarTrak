
import React from 'react';
import { Task } from '../types';
import TaskEditModal from './TaskEditModal'; // Renaming this component

// This component is being replaced by the more generic TaskEditModal.
// The props are passed through for backward compatibility with the Add Task button.
// All new edit/add logic is in TaskEditModal.tsx

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'source'>) => void;
  courses: any[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, courses }) => {
  return (
    <TaskEditModal
        isOpen={isOpen}
        onClose={onClose}
        onSaveTask={onAddTask}
        courses={courses}
    />
  );
};

export default AddTaskModal;
