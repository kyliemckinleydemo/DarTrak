
export enum TaskType {
  Assignment = 'assignment',
  Prep = 'prep',
  Reading = 'reading',
  Study = 'study',
  Quiz = 'quiz',
  Other = 'other',
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  course: string;
  due_date: string; // ISO 8601 string
  type: TaskType;
  completed: boolean;
  source: 'manual' | 'email' | 'canvas';
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  days: number[]; // 0 for Sunday, 1 for Monday, etc.
  time: string; // HH:mm format
}

export interface Settings {
  syncTimes: string[]; // HH:mm format
  canvasIcalUrl: string;
  schoolEmailDomain: string;
}

export type View = 'home' | 'tasks' | 'schedule' | 'calendar' | 'settings' | 'inbox' | 'help';