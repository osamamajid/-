import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getCustomers(req.query);
      return sendSuccess(
        res,
        result.customers,
        'تم استرجاع قائمة العملاء بنجاح',
        200,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }
      );
    } catch (error: any) {
      return sendError(res, error.message || 'حدث خطأ أثناء جلب العملاء', 400);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      return sendSuccess(res, customer, 'تم استرجاع بيانات العميل وعقوده بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'العميل غير موجود', 404);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req);
      return sendSuccess(res, customer, 'تمت إضافة العميل بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل إنشاء العميل', 400);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body, req);
      return sendSuccess(res, customer, 'تم تعديل بيانات العميل بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تعديل بيانات العميل', 400);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.deleteCustomer(req.params.id, req);
      return sendSuccess(res, result, 'تم حذف العميل بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل حذف العميل', 400);
    }
  }
}
