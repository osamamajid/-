import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class ReportController {
  static async getContractsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getContractsReport(req.query);
      return sendSuccess(res, data, 'تم استخراج تقرير العقود بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استخراج التقرير', 400);
    }
  }

  static async getRevenuesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getRevenuesReport(req.query);
      return sendSuccess(res, data, 'تم استخراج تقرير الإيرادات بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استخراج تقرير الإيرادات', 400);
    }
  }

  static async getCustomersReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getCustomersReport();
      return sendSuccess(res, data, 'تم استخراج تقرير العملاء بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استخراج تقرير العملاء', 400);
    }
  }
}
