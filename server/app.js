const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./routes/auth.routes');
const studentRoutes = require('./routes/student.routes');
const adminRoutes = require('./routes/admin.routes');
const companyRoutes = require('./routes/company.routes');
const driveRoutes = require('./routes/drive.routes');
const applicationRoutes = require('./routes/application.routes');
const testRoutes = require('./routes/test.routes');
const challengeRoutes = require('./routes/challenge.routes');
const vocabularyRoutes = require('./routes/vocabulary.routes');
const previousQuestionRoutes = require('./routes/previousQuestion.routes');
const interviewExperienceRoutes = require('./routes/interviewExperience.routes');
const videoRoutes = require('./routes/video.routes');
const resourceRoutes = require('./routes/resource.routes');
const codingRoutes = require('./routes/codingQuestion.routes');

const { getStudentDashboard } = require('./controllers/student.controller');
const { getAdminDashboard } = require('./controllers/admin.controller');
const { protect, restrictTo } = require('./middleware/auth');

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── Rate Limiting for general API ──────────────────────────
app.use('/api', apiLimiter);

// ─── Request Body & Cookie Parsing ──────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Request Logging ────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Static Files (uploads directory) ───────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check Endpoint ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Placement Portal API is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ─── Direct Dashboard Shortcut Endpoints ────────────────────
app.get('/api/dashboard/student', protect, restrictTo('student'), getStudentDashboard);
app.get('/api/dashboard/admin', protect, restrictTo('admin'), getAdminDashboard);

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/questions', previousQuestionRoutes);
app.use('/api/experiences', interviewExperienceRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/coding', codingRoutes);

// ─── 404 Route Handler ──────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// ─── Central Error Handler ──────────────────────────────────
app.use(errorHandler);

module.exports = app;
