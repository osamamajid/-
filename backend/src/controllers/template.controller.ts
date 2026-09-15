import { Request, Response, NextFunction } from 'express';
import { TemplateService } from '../services/template.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class TemplateController {
  static async getContractTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await TemplateService.getContractTypes();
      return sendSuccess(res, types, 'تم استرجاع أنواع العقود وقوالبها بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'حدث خطأ أثناء جلب أنواع العقود', 400);
    }
  }

  static async getContractTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const type = await TemplateService.getContractTypeById(req.params.id);
      return sendSuccess(res, type, 'تم استرجاع تفاصيل نوع العقد وقالب الحقول بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'نوع العقد غير موجود', 404);
    }
  }

  static async createContractType(req: Request, res: Response, next: NextFunction) {
    try {
      const type = await TemplateService.createContractType(req.body, req);
      return sendSuccess(res, type, 'تم إنشاء نوع العقد بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل إنشاء نوع العقد', 400);
    }
  }

  static async updateContractType(req: Request, res: Response, next: NextFunction) {
    try {
      const type = await TemplateService.updateContractType(req.params.id, req.body, req);
      return sendSuccess(res, type, 'تم تعديل نوع العقد بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تعديل نوع العقد', 400);
    }
  }

  static async addField(req: Request, res: Response, next: NextFunction) {
    try {
      const field = await TemplateService.addField(req.params.templateId, req.body, req);
      return sendSuccess(res, field, 'تمت إضافة الحقل إلى القالب بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل إضافة الحقل', 400);
    }
  }

  static async updateField(req: Request, res: Response, next: NextFunction) {
    try {
      const field = await TemplateService.updateField(req.params.fieldId, req.body, req);
      return sendSuccess(res, field, 'تم تعديل خصائص الحقل بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تعديل الحقل', 400);
    }
  }

  static async deleteField(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await TemplateService.deleteField(req.params.fieldId, req);
      return sendSuccess(res, result, 'تم حذف الحقل بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل حذف الحقل', 400);
    }
  }
}
