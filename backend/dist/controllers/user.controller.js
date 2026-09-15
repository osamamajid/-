"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const response_utils_1 = require("../utils/response.utils");
class UserController {
    static async getUsers(req, res, next) {
        try {
            const users = await user_service_1.UserService.getUsers();
            return (0, response_utils_1.sendSuccess)(res, users, 'تم استرجاع قائمة المستخدمين بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل جلب المستخدمين', 400);
        }
    }
    static async getRoles(req, res, next) {
        try {
            const roles = await user_service_1.UserService.getRoles();
            return (0, response_utils_1.sendSuccess)(res, roles, 'تم استرجاع الأدوار والصلاحيات بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل جلب الأدوار', 400);
        }
    }
    static async createUser(req, res, next) {
        try {
            const user = await user_service_1.UserService.createUser(req.body, req);
            return (0, response_utils_1.sendSuccess)(res, user, 'تم إنشاء المستخدم بنجاح', 201);
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل إنشاء المستخدم', 400);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const user = await user_service_1.UserService.updateUser(req.params.id, req.body, req);
            return (0, response_utils_1.sendSuccess)(res, user, 'تم تعديل المستخدم بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تعديل المستخدم', 400);
        }
    }
    static async toggleStatus(req, res, next) {
        try {
            const user = await user_service_1.UserService.toggleStatus(req.params.id, req);
            return (0, response_utils_1.sendSuccess)(res, user, 'تم تعديل حالة الحساب بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تعديل حالة المستخدم', 400);
        }
    }
    static async deleteUser(req, res, next) {
        try {
            const result = await user_service_1.UserService.deleteUser(req.params.id, req);
            return (0, response_utils_1.sendSuccess)(res, result, 'تم حذف المستخدم بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل حذف المستخدم', 400);
        }
    }
}
exports.UserController = UserController;
