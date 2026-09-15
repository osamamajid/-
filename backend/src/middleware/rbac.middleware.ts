import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import prisma from '../config/prisma';

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'غير مصرح لك بالوصول - يجب تسجيل الدخول', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'ليس لديك الصلاحية الكافية لإتمام هذه العملية', 403);
    }

    next();
  };
};

export const requirePermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(res, 'غير مصرح لك بالوصول', 401);
      }

      // إذا كان المستخدم ADMIN فله كافة الصلاحيات مباشرة
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // التحقق من الصلاحية المحددة في جدول الصلاحيات
      const userWithPermissions = await prisma.user.findUnique({
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
        return sendError(res, 'الحساب غير موجود أو تم تعطيله', 403);
      }

      const hasPerm = userWithPermissions.role.permissions.some(
        (rp) => rp.permission.code === permissionCode
      );

      if (!hasPerm) {
        return sendError(res, `ليس لديك الصلاحية المطلوبة (${permissionCode})`, 403);
      }

      next();
    } catch (error) {
      return sendError(res, 'خطأ أثناء التحقق من الصلاحيات', 500);
    }
  };
};
