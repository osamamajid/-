import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getUsers();
      return sendSuccess(res, users, 'تم استرجاع قائمة المستخدمين بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب المستخدمين', 400);
    }
  }

  static async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await UserService.getRoles();
      return sendSuccess(res, roles, 'تم استرجاع الأدوار والصلاحيات بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب الأدوار', 400);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body, req);
      return sendSuccess(res, user, 'تم إنشاء المستخدم بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل إنشاء المستخدم', 400);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateUser(req.params.id, req.body, req);
      return sendSuccess(res, user, 'تم تعديل المستخدم بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تعديل المستخدم', 400);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.toggleStatus(req.params.id, req);
      return sendSuccess(res, user, 'تم تعديل حالة الحساب بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تعديل حالة المستخدم', 400);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UserService.deleteUser(req.params.id, req);
      return sendSuccess(res, result, 'تم حذف المستخدم بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل حذف المستخدم', 400);
    }
  }
}
