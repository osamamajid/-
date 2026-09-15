import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login(username, password, req);
      return sendSuccess(res, result, 'تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تسجيل الدخول', 400);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'غير مسجل الدخول', 401);
      }
      const user = await AuthService.getCurrentUser(req.user.userId);
      return sendSuccess(res, user, 'تم استرجاع بيانات المستخدم بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'حدث خطأ أثناء جلب البيانات', 400);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return sendError(res, 'غير مسجل الدخول', 401);
      }
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword,
        req
      );
      return sendSuccess(res, result, 'تم تحديث كلمة المرور بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تغيير كلمة المرور', 400);
    }
  }
}
