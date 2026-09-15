"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const password_utils_1 = require("../utils/password.utils");
const audit_service_1 = require("./audit.service");
class UserService {
    static async getUsers() {
        const users = await prisma_1.default.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                username: true,
                email: true,
                fullName: true,
                phone: true,
                isActive: true,
                mustChangePassword: true,
                roleId: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                    },
                },
                _count: {
                    select: { createdContracts: true },
                },
                createdAt: true,
            },
        });
        return users.map((u) => ({
            ...u,
            role: u.role?.name ?? '',
            roleName: u.role?.displayName ?? '',
            contractsCount: u._count.createdContracts,
        }));
    }
    static async getRoles() {
        return prisma_1.default.role.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
    }
    static async createUser(data, req) {
        const existing = await prisma_1.default.user.findFirst({
            where: {
                OR: [{ username: data.username }, { email: data.email }],
            },
        });
        if (existing) {
            throw new Error('اسم المستخدم أو البريد الإلكتروني مسجل بالفعل');
        }
        const passwordHash = await (0, password_utils_1.hashPassword)(data.password);
        const user = await prisma_1.default.user.create({
            data: {
                username: data.username,
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phone: data.phone || null,
                roleId: data.roleId,
                isActive: true,
                mustChangePassword: data.mustChangePassword ?? false,
            },
            include: {
                role: true,
            },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'USER_CREATE',
            entity: 'User',
            entityId: user.id,
            details: { username: user.username, role: user.role.name },
            req,
        });
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
        };
    }
    static async updateUser(id, data, req) {
        const existing = await prisma_1.default.user.findUnique({ where: { id } });
        if (!existing) {
            throw new Error('المستخدم غير موجود');
        }
        const updateData = {
            fullName: data.fullName ?? existing.fullName,
            email: data.email ?? existing.email,
            phone: data.phone !== undefined ? data.phone : existing.phone,
            roleId: data.roleId ?? existing.roleId,
            isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
        };
        if (data.password) {
            updateData.passwordHash = await (0, password_utils_1.hashPassword)(data.password);
        }
        const updated = await prisma_1.default.user.update({
            where: { id },
            data: updateData,
            include: { role: true },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'USER_UPDATE',
            entity: 'User',
            entityId: id,
            details: { username: updated.username },
            req,
        });
        return {
            id: updated.id,
            username: updated.username,
            email: updated.email,
            fullName: updated.fullName,
            phone: updated.phone,
            role: updated.role,
            isActive: updated.isActive,
            mustChangePassword: updated.mustChangePassword,
        };
    }
    static async toggleStatus(id, req) {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user)
            throw new Error('المستخدم غير موجود');
        // لا يمكن تعطيل المستخدم الحالي لنفسه
        if (req?.user?.userId === id) {
            throw new Error('لا يمكنك تعطيل حسابك الشخصي النشط');
        }
        const updated = await prisma_1.default.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: updated.isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
            entity: 'User',
            entityId: id,
            details: { username: user.username, newStatus: updated.isActive },
            req,
        });
        return updated;
    }
    static async deleteUser(id, req) {
        if (req?.user?.userId === id) {
            throw new Error('لا يمكنك حذف حسابك الشخصي');
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            include: {
                _count: { select: { createdContracts: true } },
            },
        });
        if (!user)
            throw new Error('المستخدم غير موجود');
        if (user._count.createdContracts > 0) {
            throw new Error('لا يمكن حذف المستخدم لأنه قام بإنشاء عقود مسجلة، يمكنك تعطيل حسابه بدلاً من ذلك');
        }
        await prisma_1.default.user.delete({ where: { id } });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'USER_DELETE',
            entity: 'User',
            entityId: id,
            details: { username: user.username },
            req,
        });
        return { message: 'تم حذف المستخدم بنجاح' };
    }
}
exports.UserService = UserService;
