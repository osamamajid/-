"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimiter_middleware_1 = require("./middleware/rateLimiter.middleware");
const response_utils_1 = require("./utils/response.utils");
const app = (0, express_1.default)();
// Security Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const normalizedOrigin = origin ? origin.replace(/\/$/, '') : '';
        const isAllowed = env_1.ENV.ALLOWED_ORIGINS.includes('*') ||
            env_1.ENV.ALLOWED_ORIGINS.includes(normalizedOrigin) ||
            env_1.ENV.ALLOWED_ORIGINS.some((allowed) => allowed.endsWith('*') && normalizedOrigin.startsWith(allowed.slice(0, -1))) ||
            /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin) ||
            (env_1.ENV.NODE_ENV === 'development' && /^(https?:\/\/)?(10\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(normalizedOrigin));
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
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// General rate limiting
app.use('/api', rateLimiter_middleware_1.apiLimiter);
// Health check
app.get('/api/health', (req, res) => {
    return (0, response_utils_1.sendSuccess)(res, {
        status: 'UP',
        system: 'نظام عَقيد لإدارة العقود (Aqeed)',
        timestamp: new Date().toISOString(),
        environment: env_1.ENV.NODE_ENV,
    }, 'النظام يعمل بشكل ممتاز');
});
// Main API Routes
app.use('/api', routes_1.default);
// 404 Handler
app.use('*', (req, res) => {
    return (0, response_utils_1.sendError)(res, `المسار المطلوب (${req.originalUrl}) غير موجود في النظام`, 404);
});
// Central Error Handler
app.use(error_middleware_1.errorHandler);
// Start Server
if (process.env.NODE_ENV !== 'test') {
    app.listen(env_1.ENV.PORT, () => {
        console.log(`
  ======================================================
   🚀 خادم عَقيد (Aqeed Backend) يعمل بنجاح!
   🌐 الرابط: http://localhost:${env_1.ENV.PORT}
   🩺 فحص الحالة: http://localhost:${env_1.ENV.PORT}/api/health
   🕒 البيئة: ${env_1.ENV.NODE_ENV}
  ======================================================
    `);
    });
}
exports.default = app;
