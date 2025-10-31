export interface ICalEvent {
    summary: string;
    dtstart: string;
    dtend: string;
    description: string;
    uid: string;
}

// Mock data for demonstration purposes
const MOCK_ICAL_URL = 'MOCK_ICAL_URL';
const mockICalEvents: ICalEvent[] = [
    {
        uid: 'canvas-event-1',
        summary: '[CS 256] Lab 5: Implementing a Hash Table',
        dtstart: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        dtend: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        description: 'Submit your code via GitHub Classroom.'
    },
    {
        uid: 'canvas-event-2',
        summary: '[PSYC 101] Response Paper 3',
        dtstart: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        dtend: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        description: '2-page response to the assigned reading.'
    },
    {
        uid: 'canvas-event-3',
        summary: '[MATH 202] Problem Set 6',
        dtstart: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
        dtend: new Date(new Date().setDate(new Date().getDate() + 8)).toISOString(),
        description: 'Problems 1-12 from Chapter 7.'
    },
    {
        uid: 'canvas-event-4',
        summary: '[PHYS 101] Final Exam',
        dtstart: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
        dtend: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
        description: 'Comprehensive final exam covering all topics.'
    },
];

function parseICalDate(icalDate: string): string {
    const year = icalDate.substring(0, 4);
    const month = icalDate.substring(4, 6);
    const day = icalDate.substring(6, 8);
    const hour = icalDate.substring(9, 11);
    const minute = icalDate.substring(11, 13);
    const second = icalDate.substring(13, 15);
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
}

export const parseICal = (icalData: string): ICalEvent[] => {
    const events: ICalEvent[] = [];
    const eventBlocks = icalData.split('BEGIN:VEVENT');
    eventBlocks.shift(); // Remove the header part

    eventBlocks.forEach(block => {
        const lines = block.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
        const event: Partial<ICalEvent> = {};

        lines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':');
            
            if (key.startsWith('SUMMARY')) event.summary = value;
            if (key.startsWith('DTSTART')) event.dtstart = parseICalDate(value);
            if (key.startsWith('DTEND')) event.dtend = parseICalDate(value);
            if (key.startsWith('DESCRIPTION')) event.description = value.replace(/\\n/g, '\n');
            if (key.startsWith('UID')) event.uid = value;
        });

        if (event.summary && event.dtstart && event.uid) {
            events.push(event as ICalEvent);
        }
    });

    return events;
};

export const fetchAndParseICal = async (url: string): Promise<ICalEvent[]> => {
    if (url === MOCK_ICAL_URL) {
        return Promise.resolve(mockICalEvents);
    }
    if (!url) return [];
    try {
        // Use a CORS proxy to bypass browser restrictions for fetching external iCal feeds.
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            console.error(`Failed to fetch iCal feed via proxy: ${response.status} ${response.statusText}`);
            throw new Error("Could not fetch calendar. Please ensure the URL is correct and publicly accessible.");
        }
        const icalData = await response.text();
        return parseICal(icalData);
    } catch (error) {
        console.error("Error fetching or parsing iCal feed:", error);
        // This error is displayed to the user.
        throw new Error("Could not fetch calendar. Please check if the URL is correct and publicly accessible.");
    }
};