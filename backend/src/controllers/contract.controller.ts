import { Request, Response, NextFunction } from 'express';
import { ContractService } from '../services/contract.service';
import { sendSuccess, sendError } from '../utils/response.utils';
import { AuditService } from '../services/audit.service';

export class ContractController {
  static async getContracts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ContractService.getContracts(req.query as any);
      return sendSuccess(
        res,
        result.contracts,
        'تم استرجاع قائمة العقود بنجاح',
        200,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }
      );
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب قائمة العقود', 400);
    }
  }

  static async getContractById(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await ContractService.getContractById(req.params.id);
      return sendSuccess(res, contract, 'تم استرجاع تفاصيل العقد بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'العقد غير موجود', 404);
    }
  }

  static async createContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await ContractService.createContract(req.body, req);
      return sendSuccess(res, contract, 'تم إنشاء العقد وتوليد رقمه بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل إنشاء العقد', 400);
    }
  }

  static async updateContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await ContractService.updateContract(req.params.id, req.body, req);
      return sendSuccess(res, contract, 'تم تحديث بيانات العقد بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تعديل العقد', 400);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const contract = await ContractService.updateStatus(req.params.id, status, req);
      return sendSuccess(res, contract, 'تم تغيير حالة العقد بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تغيير حالة العقد', 400);
    }
  }

  static async archiveContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await ContractService.archiveContract(req.params.id, req);
      return sendSuccess(res, contract, 'تم أرشفة العقد بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل أرشفة العقد', 400);
    }
  }

  static async restoreContract(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await ContractService.restoreContract(req.params.id, req);
      return sendSuccess(res, contract, 'تمت استعادة العقد بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استعادة العقد', 400);
    }
  }

  static async deleteContract(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ContractService.softDeleteContract(req.params.id, req);
      return sendSuccess(res, result, 'تم حذف العقد مؤقتاً بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل حذف العقد', 400);
    }
  }

  static async getExpiringAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await ContractService.getExpiringAlerts();
      return sendSuccess(res, alerts, 'تم استرجاع تنبيهات العقود المقتربة من الانتهاء');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع التنبيهات', 400);
    }
  }

  static async logPdfExport(req: Request, res: Response, next: NextFunction) {
    try {
      const { contractId, contractNumber } = req.body;
      await AuditService.log({
        userId: req.user?.userId,
        action: 'PDF_EXPORT_OR_PRINT',
        entity: 'Contract',
        entityId: contractId,
        details: { contractNumber, action: 'طباعة أو تصدير PDF' },
        req,
      });
      return sendSuccess(res, { success: true }, 'تم تسجيل عملية التصدير');
    } catch (error: any) {
      return sendError(res, 'خطأ في تسجيل العملية', 500);
    }
  }
}
