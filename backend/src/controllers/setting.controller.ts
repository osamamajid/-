import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../services/setting.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class SettingController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SettingService.getSettings();
      return sendSuccess(res, data, 'تم استرجاع الإعدادات بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب الإعدادات', 400);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SettingService.updateSettings(req.body, req);
      return sendSuccess(res, data, 'تم تحديث الإعدادات بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تحديث الإعدادات', 400);
    }
  }
}
