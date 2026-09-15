import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats();
      return sendSuccess(res, stats, 'تم استرجاع إحصائيات لوحة التحكم بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب إحصائيات لوحة التحكم', 400);
    }
  }

  static async getMonthlyTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await DashboardService.getMonthlyTrends();
      return sendSuccess(res, trends, 'تم استرجاع المخطط الشهري للعقود بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب المخطط الشهري', 400);
    }
  }
}
