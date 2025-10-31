import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const settingsRouter = Router();

settingsRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await req.supabase!
      .from('settings')
      .select('sync_times, canvas_ical_url, school_email_domain')
      .eq('user_id', req.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    if (data) {
      const settingsResponse = {
        syncTimes: data.sync_times,
        canvasIcalUrl: data.canvas_ical_url,
        schoolEmailDomain: data.school_email_domain,
      };
      return res.json(settingsResponse);
    }

    res.json(null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

settingsRouter.put('/', async (req: AuthRequest, res) => {
  try {
    const { canvasIcalUrl, schoolEmailDomain, syncTimes } = req.body;

    const { data, error } = await req.supabase!
      .from('settings')
      .upsert({
        user_id: req.userId,
        canvas_ical_url: canvasIcalUrl,
        school_email_domain: schoolEmailDomain,
        sync_times: syncTimes || [],
      })
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
