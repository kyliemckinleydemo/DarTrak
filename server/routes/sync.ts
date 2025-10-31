import { Router } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { extractTasksFromEmails } from '../services/gemini.js';
import { fetchAndParseICal, ICalEvent } from '../../services/icalService.js';
import { Task, Course, TaskType } from '../../types.js';
import { fetchEmails, GmailEmail } from '../services/gmail.js';

export const syncRouter = Router();

const applyIntelligentPrepDeadlines = (
  newTasks: Omit<Task, 'user_id'>[],
  currentCourses: Course[]
): Omit<Task, 'user_id'>[] => {
  return newTasks.map(task => {
    if (task.type === TaskType.Prep && currentCourses.length > 0) {
      const taskCourse = currentCourses.find(
        c => c.name.toLowerCase() === task.course.toLowerCase()
      );
      if (taskCourse) {
        const dueDate = new Date(task.due_date);
        const dueDay = dueDate.getDay();

        if (taskCourse.days.includes(dueDay)) {
          const prepDueDate = new Date(dueDate);
          prepDueDate.setDate(prepDueDate.getDate() - 1);
          prepDueDate.setHours(20, 0, 0, 0);
          return { ...task, due_date: prepDueDate.toISOString() };
        }
      }
    }
    return task;
  });
};

syncRouter.get('/', async (req: AuthRequest, res) => {
  try {
    const { data, error } = await req.supabase!
      .from('settings')
      .select('last_sync')
      .eq('user_id', req.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching last_sync:', error.message);
      return res.status(500).json({ error: 'Failed to fetch sync status' });
    }

    res.json({ lastSync: data?.last_sync || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

syncRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    const { data: tasks } = await req.supabase!
      .from('tasks')
      .select('id')
      .eq('user_id', userId);

    const { data: pendingTasks } = await req.supabase!
      .from('pending_tasks')
      .select('id')
      .eq('user_id', userId);

    const { data: courses } = await req.supabase!
      .from('courses')
      .select('*')
      .eq('user_id', userId);

    const { data: settings } = await req.supabase!
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!settings) {
      throw new Error('Settings not found for user.');
    }

    const existingTaskIds = new Set([
      ...(tasks || []).map(t => t.id),
      ...(pendingTasks || []).map(t => t.id)
    ]);
    const discoveredCourses = new Set((courses || []).map(c => c.name));

    const isFirstSync = !settings.last_sync;
    const emails = await fetchEmails();

    let emailsToProcess: GmailEmail[];
    if (isFirstSync) {
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      emailsToProcess = emails.filter(email => new Date(email.date) >= threeWeeksAgo);
    } else {
      emailsToProcess = emails.filter(
        email => new Date(email.date) > new Date(settings.last_sync!)
      );
    }

    const schoolDomain = settings.school_email_domain?.toLowerCase();
    const filteredEmails = emailsToProcess.filter(email => {
      if (!schoolDomain) return true;
      const fromAddress = email.from.toLowerCase();
      return (
        fromAddress.endsWith(`@${schoolDomain}`) ||
        fromAddress.includes('canvas') ||
        fromAddress.endsWith('@instructure.com')
      );
    });

    const extractedAiTasks = await extractTasksFromEmails(filteredEmails);
    let newAiTasks: Omit<Task, 'user_id'>[] = extractedAiTasks.map((t: any) => {
      if (t.course) discoveredCourses.add(t.course);
      return {
        id: crypto.randomUUID(),
        title: t.title || 'Untitled Task',
        course: t.course || 'Unassigned',
        due_date: t.dueDate || new Date().toISOString(),
        type: t.type || TaskType.Other,
        completed: false,
        source: 'email' as const,
      };
    });

    const canvasEvents = settings.canvas_ical_url
      ? await fetchAndParseICal(settings.canvas_ical_url)
      : [];

    const newCanvasTasks: Omit<Task, 'user_id'>[] = canvasEvents.map(
      (event: ICalEvent) => {
        const courseNameMatch = event.summary.match(/\[(.*?)\]/);
        const courseName = courseNameMatch ? courseNameMatch[1] : 'Canvas';
        if (courseName) discoveredCourses.add(courseName);
        return {
          id: event.uid,
          title: event.summary.replace(/\[.*?\]\s*/, ''),
          course: courseName,
          due_date: event.dtend || event.dtstart,
          type: TaskType.Assignment,
          completed: false,
          source: 'canvas' as const,
        };
      }
    );

    let allNewTasks = [...newAiTasks, ...newCanvasTasks];
    allNewTasks = applyIntelligentPrepDeadlines(allNewTasks, courses || []);
    const uniqueNewTasks = allNewTasks.filter(t => !existingTaskIds.has(t.id));

    if (uniqueNewTasks.length > 0) {
      const tasksToInsert = uniqueNewTasks.map(t => ({ ...t, user_id: userId }));
      await req.supabase!.from('pending_tasks').insert(tasksToInsert);
    }

    const currentCourseNames = new Set((courses || []).map(c => c.name));
    const newlyDiscovered = Array.from(discoveredCourses).filter(
      cn => !currentCourseNames.has(cn)
    );

    if (newlyDiscovered.length > 0) {
      const newCourseObjects = newlyDiscovered.map(name => ({
        user_id: userId,
        name,
        days: [],
        time: '00:00'
      }));
      await req.supabase!.from('courses').insert(newCourseObjects);
    }

    const newLastSync = new Date().toISOString();
    await req.supabase!
      .from('settings')
      .update({ last_sync: newLastSync })
      .eq('user_id', userId);

    res.json({ success: true, newTasks: uniqueNewTasks.length });
  } catch (error: any) {
    console.error('Sync API Error:', error);
    res.status(500).json({ error: error.message });
  }
});
