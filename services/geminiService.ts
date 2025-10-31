import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskType } from '../types';
import { GmailEmail } from "./googleApiService";

// This function assumes process.env.API_KEY is available
// In a real browser environment, this key should be handled securely, typically via a backend proxy.
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // In a real app, you might show a more user-friendly error.
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey });
}

const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The title of the assignment or task.",
        },
        course: {
          type: Type.STRING,
          description: "The course name or subject for the task.",
        },
        dueDate: {
          type: Type.STRING,
          description: "The due date of the task in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ). Infer the full date and time. Assume the current year.",
        },
        type: {
          type: Type.STRING,
          description: `The type of task. Must be one of: ${Object.values(TaskType).join(', ')}.`,
        },
      },
      required: ["title", "course", "dueDate", "type"],
    },
};


export const extractTasksFromEmails = async (emails: GmailEmail[]): Promise<Partial<Task>[]> => {
  if (emails.length === 0) {
    return [];
  }

  try {
    const ai = getAiClient();
    
    const systemInstruction = `You are a highly intelligent assistant for a busy college student. Your sole purpose is to accurately parse academic-related emails and extract tasks, deadlines, and other important information. You must be meticulous and precise. Always return data in the requested JSON format.`;

    const emailBatchContent = emails.map((email, index) => `
      --- Email ${index + 1} ---
      Subject: ${email.subject}
      From: ${email.from}
      Body: ${email.body}
      --- End of Email ${index + 1} ---
    `).join('\n\n');


    const prompt = `
      Please analyze the following batch of emails from professors, TAs, or university announcement systems. Your task is to extract all academic tasks, such as assignments, prep work, reading, quizzes, or study reminders from ALL emails provided.

      Key Instructions:
      1.  **Output Format**: Provide the output as a SINGLE JSON array of objects, containing tasks from all emails combined. Strictly adhere to the provided schema. If no tasks are found in any of the emails, you MUST return an empty array ([]).
      2.  **Date Inference**: Today's date is ${new Date().toDateString()}. Use this as a reference to accurately calculate full dates from relative terms like "next Friday," "this coming Wednesday," or "tomorrow."
      3.  **Time Inference**: If a specific time is mentioned (e.g., "5pm," "at noon," "11:59 PM"), include it in the ISO 8601 dueDate. If no time is mentioned for a task, you must default to 11:59 PM (23:59:59) on the due date.
      4.  **Task Type Classification**: Correctly classify the task into one of the following categories: ${Object.values(TaskType).join(', ')}. Use 'Assignment' for homework, essays, and projects. Use 'Prep' or 'Reading' for work to be done before a class. Use 'Quiz' for quizzes and tests. Use 'Study' for general study reminders.
      5.  **Course Identification**: Extract the course name accurately. It might be mentioned as a course code (e.g., "CS 256") or a full name (e.g., "Calculus II").
      6.  **Process All Emails**: Go through every email in the batch and extract all relevant tasks.

      Email Batch to Analyze:
      ${emailBatchContent}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) return [];

    const extractedData = JSON.parse(jsonText);

    // Success, return the data
    return Array.isArray(extractedData) ? extractedData : [];

  } catch (error: any) {
    console.error("An unexpected error occurred with the Gemini API:", error);
    // On a paid plan, rate limit errors are less common. Provide a more general error message.
    throw new Error("Sync failed due to an API error. Please check your connection or try again later.");
  }
};
