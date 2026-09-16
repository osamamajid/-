import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { ENV } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { sendError, sendSuccess } from './utils/response.utils';
import { demoProtection } from './middleware/demo.middleware';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
    const isAllowed =
      ENV.ALLOWED_ORIGINS.includes('*') ||
      ENV.ALLOWED_ORIGINS.includes(normalizedOrigin) ||
      ENV.ALLOWED_ORIGINS.some((allowed) => allowed.endsWith('*') && normalizedOrigin.startsWith(allowed.slice(0, -1))) ||
      /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin) ||
      (ENV.NODE_ENV === 'development' && /^(https?:\/\/)?(10\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(normalizedOrigin));

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting
app.use('/api', apiLimiter);

// Health Check (plain)
app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' });
});

// Health Check (detailed)
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'UP',
    system: 'نظام عَقيد لإدارة العقود (Aqeed)',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  }, 'النظام يعمل بشكل ممتاز');
});

// Main API Routes
app.use('/api', apiRouter);

// 404 Handler
app.use('*', (req, res) => {
  return sendError(res, `المسار المطلوب (${req.originalUrl}) غير موجود في النظام`, 404);
});

// Central Error Handler
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`
  ======================================================
   🚀 خادم عَقيد (Aqeed Backend) يعمل بنجاح!
   🌐 الرابط: http://0.0.0.0:${ENV.PORT}
   🩺 فحص الحالة: http://localhost:${ENV.PORT}/api/health
   🕒 البيئة: ${ENV.NODE_ENV}
  ======================================================
    `);
  });
}

export default app;
