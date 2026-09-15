"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_utils_1 = require("../utils/response.utils");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    console.error('💥 Unhandled Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً';
    // في بيئة الإنتاج لا يتم إظهار تفاصيل أو Stack Trace الحساس
    const details = env_1.ENV.NODE_ENV === 'development' ? err.stack : undefined;
    return (0, response_utils_1.sendError)(res, message, statusCode, details);
};
exports.errorHandler = errorHandler;
