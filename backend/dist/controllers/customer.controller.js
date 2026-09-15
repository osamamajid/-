"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customer_service_1 = require("../services/customer.service");
const response_utils_1 = require("../utils/response.utils");
class CustomerController {
    static async getCustomers(req, res, next) {
        try {
            const result = await customer_service_1.CustomerService.getCustomers(req.query);
            return (0, response_utils_1.sendSuccess)(res, result.customers, 'تم استرجاع قائمة العملاء بنجاح', 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'حدث خطأ أثناء جلب العملاء', 400);
        }
    }
    static async getCustomerById(req, res, next) {
        try {
            const customer = await customer_service_1.CustomerService.getCustomerById(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, customer, 'تم استرجاع بيانات العميل وعقوده بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'العميل غير موجود', 404);
        }
    }
    static async createCustomer(req, res, next) {
        try {
            const customer = await customer_service_1.CustomerService.createCustomer(req.body, req);
            return (0, response_utils_1.sendSuccess)(res, customer, 'تمت إضافة العميل بنجاح', 201);
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل إنشاء العميل', 400);
        }
    }
    static async updateCustomer(req, res, next) {
        try {
            const customer = await customer_service_1.CustomerService.updateCustomer(req.params.id, req.body, req);
            return (0, response_utils_1.sendSuccess)(res, customer, 'تم تعديل بيانات العميل بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تعديل بيانات العميل', 400);
        }
    }
    static async deleteCustomer(req, res, next) {
        try {
            const result = await customer_service_1.CustomerService.deleteCustomer(req.params.id, req);
            return (0, response_utils_1.sendSuccess)(res, result, 'تم حذف العميل بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل حذف العميل', 400);
        }
    }
}
exports.CustomerController = CustomerController;
