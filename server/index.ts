import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { tasksRouter } from './routes/tasks.js';
import { pendingTasksRouter } from './routes/pending-tasks.js';
import { coursesRouter } from './routes/courses.js';
import { settingsRouter } from './routes/settings.js';
import { syncRouter } from './routes/sync.js';
import { authRouter } from './routes/auth.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes - all require authentication except OAuth callback
app.use('/api/auth/gmail/callback', authRouter); // Public callback endpoint
app.use('/api/auth', authMiddleware, authRouter); // Protected auth endpoints
app.use('/api/tasks', authMiddleware, tasksRouter);
app.use('/api/pending-tasks', authMiddleware, pendingTasksRouter);
app.use('/api/courses', authMiddleware, coursesRouter);
app.use('/api/settings', authMiddleware, settingsRouter);
app.use('/api/sync', authMiddleware, syncRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
