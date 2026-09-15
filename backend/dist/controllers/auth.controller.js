"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_utils_1 = require("../utils/response.utils");
class AuthController {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const result = await auth_service_1.AuthService.login(username, password, req);
            return (0, response_utils_1.sendSuccess)(res, result, 'تم تسجيل الدخول بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تسجيل الدخول', 400);
        }
    }
    static async me(req, res, next) {
        try {
            if (!req.user?.userId) {
                return (0, response_utils_1.sendError)(res, 'غير مسجل الدخول', 401);
            }
            const user = await auth_service_1.AuthService.getCurrentUser(req.user.userId);
            return (0, response_utils_1.sendSuccess)(res, user, 'تم استرجاع بيانات المستخدم بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'حدث خطأ أثناء جلب البيانات', 400);
        }
    }
    static async changePassword(req, res, next) {
        try {
            if (!req.user?.userId) {
                return (0, response_utils_1.sendError)(res, 'غير مسجل الدخول', 401);
            }
            const { currentPassword, newPassword } = req.body;
            const result = await auth_service_1.AuthService.changePassword(req.user.userId, currentPassword, newPassword, req);
            return (0, response_utils_1.sendSuccess)(res, result, 'تم تحديث كلمة المرور بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تغيير كلمة المرور', 400);
        }
    }
}
exports.AuthController = AuthController;
