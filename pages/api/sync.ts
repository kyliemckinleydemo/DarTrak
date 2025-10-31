
import { createServerClient } from '../../utils/supabaseServer';
import type { NextApiRequest, NextApiResponse } from 'next';
import { extractTasksFromEmails } from '../../services/geminiService';
import { fetchAndParseICal, ICalEvent } from '../../services/icalService';
import { Task, Course, TaskType } from '../../types';
import { fetchEmails, GmailEmail } from '../../services/googleApiService';

const applyIntelligentPrepDeadlines = (newTasks: Omit<Task, 'user_id'>[], currentCourses: Course[]): Omit<Task, 'user_id'>[] => {
    return newTasks.map(task => {
        if (task.type === TaskType.Prep && currentCourses.length > 0) {
            const taskCourse = currentCourses.find(c => c.name.toLowerCase() === task.course.toLowerCase());
            if (taskCourse) {
                const dueDate = new Date(task.due_date);
                const dueDay = dueDate.getDay();

                if (taskCourse.days.includes(dueDay)) {
                    const prepDueDate = new Date(dueDate);
                    prepDueDate.setDate(prepDueDate.getDate() - 1);
                    prepDueDate.setHours(20, 0, 0, 0); // 8 PM the night before
                    return { ...task, due_date: prepDueDate.toISOString() };
                }
            }
        }
        return task;
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const supabase = createServerClient(req, res);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const userId = session.user.id;

        if (req.method === 'GET') {
            const { data, error } = await supabase.from('settings').select('last_sync').eq('user_id', userId).single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = "Query returned 0 rows"
                console.error("Error fetching last_sync:", error.message);
                return res.status(500).json({ error: "Failed to fetch sync status" });
            }

            return res.status(200).json({ lastSync: data?.last_sync || null });
        }

        if (req.method === 'POST') {
            // 1. Fetch current data from DB
            const { data: tasks } = await supabase.from('tasks').select('id').eq('user_id', userId);
            const { data: pendingTasks } = await supabase.from('pending_tasks').select('id').eq('user_id', userId);
            const { data: courses } = await supabase.from('courses').select('*').eq('user_id', userId);
            const { data: settings } = await supabase.from('settings').select('*').eq('user_id', userId).single();

            if (!settings) throw new Error("Settings not found for user.");

            const existingTaskIds = new Set([...(tasks || []).map(t => t.id), ...(pendingTasks || []).map(t => t.id)]);
            const discoveredCourses = new Set((courses || []).map(c => c.name));

            // 2. Fetch external data (Emails and Canvas)
            const isFirstSync = !settings.last_sync;
            const emails = await fetchEmails(); // Using server-side mock service
            
            let emailsToProcess: GmailEmail[];
            if (isFirstSync) {
                const threeWeeksAgo = new Date();
                threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
                emailsToProcess = emails.filter(email => new Date(email.date) >= threeWeeksAgo);
            } else {
                emailsToProcess = emails.filter(email => new Date(email.date) > new Date(settings.last_sync!));
            }

            const schoolDomain = settings.school_email_domain?.toLowerCase();
            const filteredEmails = emailsToProcess.filter(email => {
                if (!schoolDomain) return true;
                const fromAddress = email.from.toLowerCase();
                return fromAddress.endsWith(`@${schoolDomain}`) || fromAddress.includes('canvas') || fromAddress.endsWith('@instructure.com');
            });

            // 3. Process data with Gemini API (securely on the backend)
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
                    source: 'email',
                };
            });

            const canvasEvents = settings.canvas_ical_url ? await fetchAndParseICal(settings.canvas_ical_url) : [];
            const newCanvasTasks: Omit<Task, 'user_id'>[] = canvasEvents.map((event: ICalEvent) => {
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
                    source: 'canvas',
                };
            });

            // 4. Combine, deduplicate, and apply logic
            let allNewTasks = [...newAiTasks, ...newCanvasTasks];
            allNewTasks = applyIntelligentPrepDeadlines(allNewTasks, courses || []);
            const uniqueNewTasks = allNewTasks.filter(t => !existingTaskIds.has(t.id));

            // 5. Update database
            if (uniqueNewTasks.length > 0) {
                const tasksToInsert = uniqueNewTasks.map(t => ({ ...t, user_id: userId }));
                await supabase.from('pending_tasks').insert(tasksToInsert);
            }

            const currentCourseNames = new Set((courses || []).map(c => c.name));
            const newlyDiscovered = Array.from(discoveredCourses).filter(cn => !currentCourseNames.has(cn));
            if (newlyDiscovered.length > 0) {
                const newCourseObjects = newlyDiscovered.map(name => ({ user_id: userId, name, days: [], time: '00:00' }));
                await supabase.from('courses').insert(newCourseObjects);
            }

            const newLastSync = new Date().toISOString();
            await supabase.from('settings').update({ last_sync: newLastSync }).eq('user_id', userId);

            return res.status(200).json({ success: true, newTasks: uniqueNewTasks.length });

        } catch (error: any) {
            console.error("Sync API Error:", error);
            return res.status(500).json({ error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
