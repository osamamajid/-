import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.LOAD_TEST === 'true' ? 1_000_000 : 20, // Test-only bypass for isolated load testing
  message: {
    success: false,
    message: 'تجاوزت الحد المسموح من محاولات تسجيل الدخول، يرجى المحاولة لاحقاً بعد 15 دقيقة',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.LOAD_TEST === 'true' ? 1_000_000 : 300, // Test-only bypass for isolated load testing
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لعدد الطلبات، يرجى الانتظار قليلاً',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
