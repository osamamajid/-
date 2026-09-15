"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("../services/audit.service");
const response_utils_1 = require("../utils/response.utils");
class AuditController {
    static async getLogs(req, res, next) {
        try {
            const result = await audit_service_1.AuditService.getLogs(req.query);
            return (0, response_utils_1.sendSuccess)(res, result.logs, 'تم استرجاع سجل العمليات بنجاح', 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل جلب سجل العمليات', 400);
        }
    }
    static async trackActivity(req, res, next) {
        try {
            const { type, action, label, page, target, fieldName, valuePreview } = req.body || {};
            if (!type || !action || !page) {
                return (0, response_utils_1.sendError)(res, 'بيانات النشاط غير مكتملة', 400);
            }
            await audit_service_1.AuditService.log({
                userId: req.user?.userId,
                action: `UI_${type}_${action}`,
                entity: 'UserActivity',
                entityId: req.user?.userId || null,
                details: {
                    type,
                    action,
                    label,
                    page,
                    target,
                    fieldName,
                    valuePreview,
                    userAgent: req.headers['user-agent'] || 'unknown',
                    path: req.originalUrl,
                },
                req,
            });
            return (0, response_utils_1.sendSuccess)(res, { tracked: true }, 'تم تسجيل نشاط المستخدم بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تسجيل نشاط المستخدم', 400);
        }
    }
}
exports.AuditController = AuditController;
