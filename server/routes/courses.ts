import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const coursesRouter = Router();

coursesRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await req.supabase!
      .from('courses')
      .select('*')
      .eq('user_id', req.userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

coursesRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, days, time } = req.body;

    const { data, error } = await req.supabase!
      .from('courses')
      .insert({ user_id: req.userId, name, days, time })
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

coursesRouter.delete('/', async (req: AuthRequest, res) => {
  try {
    const { id } = req.query;

    const { error } = await req.supabase!
      .from('courses')
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
