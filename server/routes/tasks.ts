import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Task, TaskType } from '../../types.js';

export const tasksRouter = Router();

tasksRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await req.supabase!
      .from('tasks')
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

tasksRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { title, course, due_date, type } = req.body;

    const newTask: Omit<Task, 'id' | 'completed' | 'source'> = {
      user_id: req.userId!,
      title,
      course,
      due_date,
      type: type || TaskType.Other,
    };

    const { data, error } = await req.supabase!
      .from('tasks')
      .insert({
        ...newTask,
        id: crypto.randomUUID(),
        completed: false,
        source: 'manual'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

tasksRouter.put('/', async (req: AuthRequest, res) => {
  try {
    const { id } = req.query;
    const { title, course, due_date, type, completed } = req.body;

    const { data, error } = await req.supabase!
      .from('tasks')
      .update({ title, course, due_date, type, completed })
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

tasksRouter.delete('/', async (req: AuthRequest, res) => {
  try {
    const { id } = req.query;

    const { error } = await req.supabase!
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(204).end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
