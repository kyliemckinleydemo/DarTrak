
import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { Task, Course, Settings } from '../types';
import { apiClient } from '../utils/apiClient';

// A simple fetcher function for SWR
const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export const useTaskManager = () => {
  const { data: tasks, error: tasksError, isLoading: tasksLoading } = useSWR<Task[]>('/api/tasks', fetcher);
  const { data: pendingTasks, error: pendingTasksError, isLoading: pendingTasksLoading } = useSWR<Task[]>('/api/pending-tasks', fetcher);
  const { data: courses, error: coursesError, isLoading: coursesLoading } = useSWR<Course[]>('/api/courses', fetcher);
  const { data: settings, error: settingsError, isLoading: settingsLoading } = useSWR<Settings>('/api/settings', fetcher);
  const { data: lastSyncData, isLoading: lastSyncLoading } = useSWR<{ lastSync: string | null }>('/api/sync', fetcher);

  const isLoading = tasksLoading || pendingTasksLoading || coursesLoading || settingsLoading || lastSyncLoading;
  const error = tasksError || pendingTasksError || coursesError || settingsError;

  const syncData = useCallback(async () => {
    try {
      const { data } = await apiClient.post('/api/sync');
      // Revalidate all data after a sync
      mutate('/api/pending-tasks');
      mutate('/api/courses');
      mutate('/api/sync');
      return data;
    } catch (e: any) {
      console.error("Sync failed:", e);
      throw new Error(e.response?.data?.error || "Failed to sync data.");
    }
  }, []);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'completed' | 'source' | 'user_id'>) => {
    await apiClient.post('/api/tasks', task);
    mutate('/api/tasks');
  }, []);
  
  const updateTask = useCallback(async (task: Task) => {
    await apiClient.put(`/api/tasks?id=${task.id}`, task);
    mutate('/api/tasks');
  }, []);

  const toggleTaskCompleted = useCallback(async (taskId: string) => {
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
      await updateTask({ ...task, completed: !task.completed });
    }
  }, [tasks, updateTask]);
  
  const deleteTask = useCallback(async (taskId: string) => {
    await apiClient.delete(`/api/tasks?id=${taskId}`);
    mutate('/api/tasks');
  }, []);

  const snoozeTask = useCallback(async (taskId: string, duration: '1d' | '2d' | '1w') => {
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
        const newDueDate = new Date(task.due_date);
        if (duration === '1d') newDueDate.setDate(newDueDate.getDate() + 1);
        if (duration === '2d') newDueDate.setDate(newDueDate.getDate() + 2);
        if (duration === '1w') newDueDate.setDate(newDueDate.getDate() + 7);
        await updateTask({ ...task, due_date: newDueDate.toISOString() });
    }
  }, [tasks, updateTask]);
  
  const acceptPendingTask = useCallback(async (taskId: string) => {
    await apiClient.post('/api/pending-tasks/accept', { taskId });
    mutate('/api/tasks');
    mutate('/api/pending-tasks');
  }, []);

  const rejectPendingTask = useCallback(async (taskId: string) => {
      await apiClient.post('/api/pending-tasks/reject', { taskId });
      mutate('/api/pending-tasks');
  }, []);

  const updateAndAcceptPendingTask = useCallback(async (taskId: string, updatedTask: Omit<Task, 'id' | 'completed' | 'source' | 'user_id'>) => {
    await apiClient.post('/api/pending-tasks/update-and-accept', { taskId, updatedTask });
    mutate('/api/tasks');
    mutate('/api/pending-tasks');
  }, []);

  const acceptAllPending = useCallback(async () => {
    await apiClient.post('/api/pending-tasks/accept-all');
    mutate('/api/tasks');
    mutate('/api/pending-tasks');
  }, []);

  const rejectAllPending = useCallback(async () => {
    await apiClient.post('/api/pending-tasks/reject-all');
    mutate('/api/pending-tasks');
  }, []);

  const addCourse = useCallback(async (course: Omit<Course, 'id' | 'user_id'>) => {
    await apiClient.post('/api/courses', course);
    mutate('/api/courses');
  }, []);

  const deleteCourse = useCallback(async (courseId: string) => {
    await apiClient.delete(`/api/courses?id=${courseId}`);
    mutate('/api/courses');
  }, []);

  const updateSettings = useCallback(async (newSettings: Settings) => {
    await apiClient.put('/api/settings', newSettings);
    mutate('/api/settings');
  }, []);

  return {
    tasks: tasks || [],
    pendingTasks: pendingTasks || [],
    courses: courses || [],
    settings: settings,
    isLoading,
    error: error ? "Failed to load data." : null,
    lastSync: lastSyncData?.lastSync || null,
    syncData,
    addTask,
    toggleTaskCompleted,
    deleteTask,
    snoozeTask,
    addCourse,
    deleteCourse,
    setSettings: updateSettings,
    acceptPendingTask,
    rejectPendingTask,
    updateAndAcceptPendingTask,
    acceptAllPending,
    rejectAllPending,
  };
};