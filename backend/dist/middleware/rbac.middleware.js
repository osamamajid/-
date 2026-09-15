"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRoles = void 0;
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = __importDefault(require("../config/prisma"));
const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_utils_1.sendError)(res, 'غير مصرح لك بالوصول - يجب تسجيل الدخول', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            return (0, response_utils_1.sendError)(res, 'ليس لديك الصلاحية الكافية لإتمام هذه العملية', 403);
        }
        next();
    };
};
exports.requireRoles = requireRoles;
const requirePermission = (permissionCode) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return (0, response_utils_1.sendError)(res, 'غير مصرح لك بالوصول', 401);
            }
            // إذا كان المستخدم ADMIN فله كافة الصلاحيات مباشرة
            if (req.user.role === 'ADMIN') {
                return next();
            }
            // التحقق من الصلاحية المحددة في جدول الصلاحيات
            const userWithPermissions = await prisma_1.default.user.findUnique({
                where: { id: req.user.userId },
                include: {
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!userWithPermissions || !userWithPermissions.isActive) {
                return (0, response_utils_1.sendError)(res, 'الحساب غير موجود أو تم تعطيله', 403);
            }
            const hasPerm = userWithPermissions.role.permissions.some((rp) => rp.permission.code === permissionCode);
            if (!hasPerm) {
                return (0, response_utils_1.sendError)(res, `ليس لديك الصلاحية المطلوبة (${permissionCode})`, 403);
            }
            next();
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, 'خطأ أثناء التحقق من الصلاحيات', 500);
        }
    };
};
exports.requirePermission = requirePermission;
