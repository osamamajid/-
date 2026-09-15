import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class AuditController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuditService.getLogs(req.query);
      return sendSuccess(
        res,
        result.logs,
        'تم استرجاع سجل العمليات بنجاح',
        200,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }
      );
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب سجل العمليات', 400);
    }
  }

  static async trackActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, action, label, page, target, fieldName, valuePreview } = req.body || {};

      if (!type || !action || !page) {
        return sendError(res, 'بيانات النشاط غير مكتملة', 400);
      }

      await AuditService.log({
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

      return sendSuccess(res, { tracked: true }, 'تم تسجيل نشاط المستخدم بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تسجيل نشاط المستخدم', 400);
    }
  }
}
