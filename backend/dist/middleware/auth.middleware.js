"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
            return (0, response_utils_1.sendError)(res, 'يرجى تسجيل الدخول للوصول إلى هذا المورد', 401);
        }
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (!token || token.length < 20) {
            return (0, response_utils_1.sendError)(res, 'رمز المصادقة غير صالح', 401);
        }
        const decoded = (0, jwt_utils_1.verifyToken)(token);
        if (!decoded?.userId || typeof decoded.userId !== 'string') {
            return (0, response_utils_1.sendError)(res, 'رمز المصادقة غير صالح', 401);
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return (0, response_utils_1.sendError)(res, 'انتهت صلاحية الجلسة أو الرمز غير صالح', 401);
    }
};
exports.authenticate = authenticate;
