import { google } from 'googleapis';
import { oauth2Client, isGmailConfigured } from '../config/gmail.js';
import { createClient } from '@supabase/supabase-js';

export interface GmailEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
}

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Mock emails for when Gmail OAuth is not configured
const mockEmails: GmailEmail[] = [
  {
    id: 'email1',
    from: 'prof.anderson@dartmouth.edu',
    subject: 'Reminder: Psychology 101 Midterm Essay',
    body: `Hi class, this is a reminder that your midterm essay on Freud's theory of psychosexual development is due next Friday, Oct 27th at 11:59 PM. Please submit it through the portal. The prompt is attached. Best, Prof. Anderson`,
    date: daysAgo(2),
  },
  {
    id: 'email2',
    from: 'prof.chen@dartmouth.edu',
    subject: 'CS 256 - Prep for Monday\'s class',
    body: `Hello everyone, for our next class on Monday, please read Chapter 5 of "Algorithms Unlocked". We will be discussing Big O notation in depth. There will be a short quiz at the beginning of class covering the reading material. See you then.`,
    date: daysAgo(5),
  },
  {
    id: 'email3',
    from: 'ta.sarah@dartmouth.edu',
    subject: 'Calculus II - Homework 4 due date',
    body: `Hi Math 202 students, just confirming that Homework 4, which covers integration by parts, is due this coming Wednesday at 5pm. Make sure you show all your work.`,
    date: daysAgo(10),
  },
  {
    id: 'email4',
    from: 'prof.davis@dartmouth.edu',
    subject: 'ENGL 205: Final Project Update',
    body: `Dear students, I've updated the final project guidelines. The proposal is now due on November 10th. The annotated bibliography is due November 22nd. The final paper itself is due December 8th. Please check Canvas for the full details.`,
    date: daysAgo(15),
  },
  {
    id: 'email5',
    from: 'noreply@canvas.instructure.com',
    subject: 'Announcement: Guest Speaker in HIST 04',
    body: `Just a heads up that we have a guest speaker, Dr. Eleanor Vance, joining our class this Thursday to discuss the economic impacts of the Silk Road. There is no required prep, but I encourage you to think of some questions.`,
    date: daysAgo(20),
  },
  {
    id: 'email6',
    from: 'prof.roberts@dartmouth.edu',
    subject: 'PHYS 101 - Weekly Reading',
    body: `For this week, please ensure you have read Chapter 8 in the textbook on Thermodynamics before our Wednesday lecture.`,
    date: daysAgo(25),
  },
  {
    id: 'email7',
    from: 'dean.office@dartmouth.edu',
    subject: 'Important: Final Exam Schedule',
    body: `The final exam schedule has been posted. Your PHYS 101 exam is on Dec 12th at 9 AM. Your CS 256 exam is on Dec 14th at 2 PM.`,
    date: daysAgo(30),
  },
  {
    id: 'email8',
    from: 'prof.anderson@dartmouth.edu',
    subject: 'Psychology 101 - Quiz tomorrow!',
    body: `Friendly reminder that there will be a short quiz at the start of class tomorrow covering the material on classical conditioning.`,
    date: daysAgo(1),
  }
];

// Extract plain text from email body
function decodeEmailBody(body: any): string {
  if (!body) return '';

  let data = body.data;
  if (body.parts) {
    // Multipart message - get text/plain part
    const textPart = body.parts.find((part: any) => part.mimeType === 'text/plain');
    if (textPart?.body?.data) {
      data = textPart.body.data;
    }
  }

  if (!data) return '';

  // Decode base64url
  const decoded = Buffer.from(data, 'base64url').toString('utf-8');
  return decoded.trim();
}

// Fetch emails using real Gmail API
async function fetchRealEmails(userId: string): Promise<GmailEmail[]> {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get stored OAuth tokens
    const { data: tokenData, error } = await supabase
      .from('gmail_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !tokenData) {
      console.log('No Gmail tokens found for user, using mock data');
      return mockEmails;
    }

    // Check if token is expired
    const now = Date.now();
    const expiry = tokenData.token_expiry ? new Date(tokenData.token_expiry).getTime() : 0;

    if (expiry && expiry < now && tokenData.refresh_token) {
      // Refresh the token
      oauth2Client.setCredentials({
        refresh_token: tokenData.refresh_token,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update stored tokens
      await supabase
        .from('gmail_tokens')
        .update({
          access_token: credentials.access_token,
          token_expiry: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
        })
        .eq('user_id', userId);

      oauth2Client.setCredentials(credentials);
    } else {
      // Use existing token
      oauth2Client.setCredentials({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
      });
    }

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch messages from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const query = `after:${Math.floor(thirtyDaysAgo.getTime() / 1000)}`;

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    const emails: GmailEmail[] = [];

    // Fetch details for each message
    for (const message of messages.slice(0, 20)) { // Limit to 20 most recent
      try {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'full',
        });

        const headers = details.data.payload?.headers || [];
        const from = headers.find(h => h.name === 'From')?.value || '';
        const subject = headers.find(h => h.name === 'Subject')?.value || '';
        const dateHeader = headers.find(h => h.name === 'Date')?.value || '';
        const body = decodeEmailBody(details.data.payload);

        emails.push({
          id: message.id!,
          from,
          subject,
          body: body.substring(0, 2000), // Limit body length
          date: dateHeader ? new Date(dateHeader).toISOString() : new Date().toISOString(),
        });
      } catch (err) {
        console.error(`Error fetching message ${message.id}:`, err);
      }
    }

    console.log(`Fetched ${emails.length} real emails from Gmail`);
    return emails;
  } catch (error) {
    console.error('Error fetching real emails:', error);
    return mockEmails;
  }
}

export async function fetchEmails(userId?: string): Promise<GmailEmail[]> {
  // If Gmail OAuth not configured or no user ID, use mock data
  if (!isGmailConfigured() || !userId) {
    console.log("Gmail OAuth not configured or no user ID, using mock data");
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockEmails), 500);
    });
  }

  // Try to fetch real emails
  return fetchRealEmails(userId);
}
