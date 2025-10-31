
import React from 'react';
import { TaskType } from './types';

export const TASK_TYPE_CONFIG: Record<TaskType, { color: string; icon: React.ReactNode }> = {
  [TaskType.Assignment]: { color: 'bg-blue-500', icon: null },
  [TaskType.Prep]: { color: 'bg-purple-500', icon: null },
  [TaskType.Reading]: { color: 'bg-green-500', icon: null },
  [TaskType.Study]: { color: 'bg-yellow-500', icon: null },
  [TaskType.Quiz]: { color: 'bg-red-500', icon: null },
  [TaskType.Other]: { color: 'bg-gray-500', icon: null },
};
