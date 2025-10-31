import { google } from 'googleapis';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || 'http://localhost:3001/api/auth/gmail/callback';

if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
  console.warn('Gmail OAuth credentials not configured. Gmail integration will use mock data.');
}

export const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

// Scopes required for reading Gmail
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
];

export function getAuthUrl(userId: string): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    state: userId, // Pass userId to identify user after callback
    prompt: 'consent', // Force consent screen to get refresh token
  });
}

export function isGmailConfigured(): boolean {
  return !!(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET);
}
