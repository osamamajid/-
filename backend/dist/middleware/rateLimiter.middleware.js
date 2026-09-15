"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login requests per windowMs
    message: {
        success: false,
        message: 'تجاوزت الحد المسموح من محاولات تسجيل الدخول، يرجى المحاولة لاحقاً بعد 15 دقيقة',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // Limit each IP to 300 requests per minute
    message: {
        success: false,
        message: 'تم تجاوز الحد الأقصى لعدد الطلبات، يرجى الانتظار قليلاً',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
