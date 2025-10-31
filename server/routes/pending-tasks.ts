import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const pendingTasksRouter = Router();

pendingTasksRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await req.supabase!
      .from('pending_tasks')
      .select('*')
      .eq('user_id', req.userId)
      .order('due_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

pendingTasksRouter.post('/accept', async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.body;

    const { data: task, error: fetchError } = await req.supabase!
      .from('pending_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await req.supabase!.from('tasks').insert(task);
    await req.supabase!.from('pending_tasks').delete().match({ id: taskId, user_id: req.userId });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

pendingTasksRouter.post('/reject', async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.body;

    await req.supabase!
      .from('pending_tasks')
      .delete()
      .match({ id: taskId, user_id: req.userId });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

pendingTasksRouter.post('/update-and-accept', async (req: AuthRequest, res) => {
  try {
    const { taskId, updatedTask } = req.body;

    const { data: task, error: fetchError } = await req.supabase!
      .from('pending_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', req.userId)
      .single();

    if (fetchError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const finalTask = { ...task, ...updatedTask, completed: false };

    await req.supabase!.from('tasks').insert(finalTask);
    await req.supabase!.from('pending_tasks').delete().match({ id: taskId, user_id: req.userId });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

pendingTasksRouter.post('/accept-all', async (req: AuthRequest, res) => {
  try {
    const { data: pending, error: fetchError } = await req.supabase!
      .from('pending_tasks')
      .select('*')
      .eq('user_id', req.userId);

    if (fetchError) {
      throw fetchError;
    }

    if (pending && pending.length > 0) {
      await req.supabase!.from('tasks').insert(pending);
      await req.supabase!.from('pending_tasks').delete().eq('user_id', req.userId);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

pendingTasksRouter.post('/reject-all', async (req: AuthRequest, res) => {
  try {
    await req.supabase!
      .from('pending_tasks')
      .delete()
      .eq('user_id', req.userId);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
