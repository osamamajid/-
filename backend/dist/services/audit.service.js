"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class AuditService {
    static async log({ userId, action, entity, entityId, details, req }) {
        try {
            let ipAddress = '127.0.0.1';
            if (req) {
                ipAddress =
                    req.headers['x-forwarded-for']?.split(',')[0] ||
                        req.socket?.remoteAddress ||
                        '127.0.0.1';
            }
            await prisma_1.default.auditLog.create({
                data: {
                    userId: userId || null,
                    action,
                    entity,
                    entityId: entityId || null,
                    details: details ? JSON.stringify(details) : null,
                    ipAddress,
                },
            });
        }
        catch (error) {
            console.error('Failed to write audit log:', error);
        }
    }
    static async getLogs(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.action) {
            where.action = query.action;
        }
        if (query.entity) {
            where.entity = query.entity;
        }
        const [logs, total] = await Promise.all([
            prisma_1.default.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            role: { select: { displayName: true } },
                        },
                    },
                },
            }),
            prisma_1.default.auditLog.count({ where }),
        ]);
        return {
            logs: logs.map((log) => ({
                ...log,
                details: log.details ? JSON.parse(log.details) : null,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.AuditService = AuditService;
