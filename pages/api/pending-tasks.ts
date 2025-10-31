
import { createServerClient } from '../../utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';

const handlePostAction = async (req: NextApiRequest, res: NextApiResponse, action: string) => {
    const supabase = createServerClient(req, res);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return res.status(401).json({ error: 'Not authenticated' });
    const userId = session.user.id;

    try {
        switch (action) {
            case 'accept': {
                const { taskId } = req.body;
                const { data: task, error: fetchError } = await supabase.from('pending_tasks').select('*').eq('id', taskId).eq('user_id', userId).single();
                if (fetchError || !task) return res.status(404).json({ error: 'Task not found' });

                await supabase.from('tasks').insert(task);
                await supabase.from('pending_tasks').delete().match({ id: taskId, user_id: userId });
                break;
            }
            case 'reject': {
                const { taskId } = req.body;
                await supabase.from('pending_tasks').delete().match({ id: taskId, user_id: userId });
                break;
            }
            case 'update-and-accept': {
                const { taskId, updatedTask } = req.body;
                const { data: task, error: fetchError } = await supabase.from('pending_tasks').select('*').eq('id', taskId).eq('user_id', userId).single();
                if (fetchError || !task) return res.status(404).json({ error: 'Task not found' });
                
                const finalTask = { ...task, ...updatedTask, completed: false };
                await supabase.from('tasks').insert(finalTask);
                await supabase.from('pending_tasks').delete().match({ id: taskId, user_id: userId });
                break;
            }
            case 'accept-all': {
                const { data: pending, error: fetchError } = await supabase.from('pending_tasks').select('*').eq('user_id', userId);
                if (fetchError) throw fetchError;
                if (pending && pending.length > 0) {
                    await supabase.from('tasks').insert(pending);
                    await supabase.from('pending_tasks').delete().eq('user_id', userId);
                }
                break;
            }
            case 'reject-all': {
                await supabase.from('pending_tasks').delete().eq('user_id', userId);
                break;
            }
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
        return res.status(200).json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
        const supabase = createServerClient(req, res);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return res.status(401).json({ error: 'Not authenticated' });

        const { data, error } = await supabase.from('pending_tasks').select('*').eq('user_id', session.user.id).order('due_date', { ascending: true });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    } else if (req.method === 'POST') {
        const action = req.url?.split('/').pop() || '';
        return handlePostAction(req, res, action);
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
