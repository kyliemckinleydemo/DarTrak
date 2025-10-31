// IMPORTANT: This is a server-side only module.
// It simulates fetching data from the Google Gmail API.
// In a real application, this file would contain the logic to use
// a user's OAuth token to securely fetch their emails.

export interface GmailEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string; // ISO String date
}

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

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
    date: daysAgo(25), // Older than 3 weeks
  },
  {
    id: 'email7',
    from: 'dean.office@dartmouth.edu',
    subject: 'Important: Final Exam Schedule',
    body: `The final exam schedule has been posted. Your PHYS 101 exam is on Dec 12th at 9 AM. Your CS 256 exam is on Dec 14th at 2 PM.`,
    date: daysAgo(30), // Older than 3 weeks
  },
  {
    id: 'email8',
    from: 'prof.anderson@dartmouth.edu',
    subject: 'Psychology 101 - Quiz tomorrow!',
    body: `Friendly reminder that there will be a short quiz at the start of class tomorrow covering the material on classical conditioning.`,
    date: daysAgo(1),
  }
];

// In a real implementation, this would be an async function making a call to the Gmail API
export const fetchEmails = (): Promise<GmailEmail[]> => {
  console.log("Fetching emails from server-side googleApiService (mock)...")
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEmails);
    }, 500); // Simulate network latency
  });
};
