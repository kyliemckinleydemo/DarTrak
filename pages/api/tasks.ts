
import { createServerClient } from '../../utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Task, TaskType } from '../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerClient(req, res);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = session.user.id;

    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .order('due_date', { ascending: true });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
      case 'POST': {
        const { title, course, due_date, type } = req.body;
        const newTask: Omit<Task, 'id' | 'completed' | 'source'> = {
          user_id: userId,
          title,
          course,
          due_date,
          type: type || TaskType.Other,
        };
        const { data, error } = await supabase
          .from('tasks')
          .insert({ ...newTask, id: crypto.randomUUID(), completed: false, source: 'manual' })
          .select()
          .single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
      }
      case 'PUT': {
        const { id } = req.query;
        const { title, course, due_date, type, completed } = req.body;
        const { data, error } = await supabase
          .from('tasks')
          .update({ title, course, due_date, type, completed })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
      case 'DELETE': {
        const { id } = req.query;
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(204).end();
      }
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
     return res.status(500).json({ error: error.message });
  }
}
