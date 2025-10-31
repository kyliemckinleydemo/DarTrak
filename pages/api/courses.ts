
import { createServerClient } from '../../utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

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
          .from('courses')
          .select('*')
          .eq('user_id', userId);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
      case 'POST': {
        const { name, days, time } = req.body;
        const { data, error } = await supabase
          .from('courses')
          .insert({ user_id: userId, name, days, time })
          .select()
          .single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
      }
      case 'DELETE': {
        const { id } = req.query;
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(204).end();
      }
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch(error: any) {
    return res.status(500).json({ error: error.message });
  }
}
