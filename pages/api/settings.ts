
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
          .from('settings')
          .select('sync_times, canvas_ical_url, school_email_domain')
          .eq('user_id', userId)
          .single(); 

        if (error && error.code !== 'PGRST116') { // Ignore 'exact one row' error for new users
          return res.status(500).json({ error: error.message });
        }
        
        if (data) {
          // Map snake_case from DB to camelCase for the client
          const settingsResponse = {
              syncTimes: data.sync_times,
              canvasIcalUrl: data.canvas_ical_url,
              schoolEmailDomain: data.school_email_domain,
          };
          return res.status(200).json(settingsResponse);
        }
        
        return res.status(200).json(null);
      }
      case 'PUT': {
        const { canvasIcalUrl, schoolEmailDomain, syncTimes } = req.body;
        const { data, error } = await supabase
          .from('settings')
          .upsert({
            user_id: userId,
            canvas_ical_url: canvasIcalUrl,
            school_email_domain: schoolEmailDomain,
            sync_times: syncTimes || [],
          })
          .select()
          .single();
          
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch(error: any) {
    res.status(500).json({ error: error.message });
  }
}
