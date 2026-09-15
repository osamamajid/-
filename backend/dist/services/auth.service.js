"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const password_utils_1 = require("../utils/password.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
const audit_service_1 = require("./audit.service");
class AuthService {
    static async login(username, password, req) {
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ username }, { email: username }],
            },
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
        if (!user) {
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
        if (!user.isActive) {
            throw new Error('هذا الحساب معطل، يرجى التواصل مع إدارة النظام');
        }
        const isValid = await (0, password_utils_1.comparePassword)(password, user.passwordHash);
        if (!isValid) {
            throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
        const permissions = user.role.permissions.map((rp) => rp.permission.code);
        const token = (0, jwt_utils_1.signToken)({
            userId: user.id,
            username: user.username,
            role: user.role.name,
            roleName: user.role.displayName,
            mustChangePassword: user.mustChangePassword,
        });
        // تسجيل الدخول في سجل العمليات
        await audit_service_1.AuditService.log({
            userId: user.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            details: { message: 'تسجيل دخول ناجح للمستخدم' },
            req,
        });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                role: user.role.name,
                roleName: user.role.displayName,
                mustChangePassword: user.mustChangePassword,
                permissions,
            },
        };
    }
    static async changePassword(userId, currentPass, newPass, req) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('المستخدم غير موجود');
        }
        const isValid = await (0, password_utils_1.comparePassword)(currentPass, user.passwordHash);
        if (!isValid) {
            throw new Error('كلمة المرور الحالية غير صحيحة');
        }
        const newHash = await (0, password_utils_1.hashPassword)(newPass);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                passwordHash: newHash,
                mustChangePassword: false, // رفع إجبار التغيير
            },
        });
        await audit_service_1.AuditService.log({
            userId,
            action: 'PASSWORD_CHANGE',
            entity: 'User',
            entityId: userId,
            details: { message: 'تم تغيير كلمة المرور بنجاح' },
            req,
        });
        return { message: 'تم تغيير كلمة المرور بنجاح' };
    }
    static async getCurrentUser(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
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
        if (!user) {
            throw new Error('المستخدم غير موجود');
        }
        const permissions = user.role.permissions.map((rp) => rp.permission.code);
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role.name,
            roleName: user.role.displayName,
            mustChangePassword: user.mustChangePassword,
            permissions,
        };
    }
}
exports.AuthService = AuthService;
