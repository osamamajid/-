"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const template_service_1 = require("../services/template.service");
const response_utils_1 = require("../utils/response.utils");
class TemplateController {
    static async getContractTypes(req, res, next) {
        try {
            const types = await template_service_1.TemplateService.getContractTypes();
            return (0, response_utils_1.sendSuccess)(res, types, 'تم استرجاع أنواع العقود وقوالبها بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'حدث خطأ أثناء جلب أنواع العقود', 400);
        }
    }
    static async getContractTypeById(req, res, next) {
        try {
            const type = await template_service_1.TemplateService.getContractTypeById(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, type, 'تم استرجاع تفاصيل نوع العقد وقالب الحقول بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'نوع العقد غير موجود', 404);
        }
    }
    static async createContractType(req, res, next) {
        try {
            const type = await template_service_1.TemplateService.createContractType(req.body, req);
            return (0, response_utils_1.sendSuccess)(res, type, 'تم إنشاء نوع العقد بنجاح', 201);
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل إنشاء نوع العقد', 400);
        }
    }
    static async updateContractType(req, res, next) {
        try {
            const type = await template_service_1.TemplateService.updateContractType(req.params.id, req.body, req);
            return (0, response_utils_1.sendSuccess)(res, type, 'تم تعديل نوع العقد بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تعديل نوع العقد', 400);
        }
    }
    static async addField(req, res, next) {
        try {
            const field = await template_service_1.TemplateService.addField(req.params.templateId, req.body, req);
            return (0, response_utils_1.sendSuccess)(res, field, 'تمت إضافة الحقل إلى القالب بنجاح', 201);
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل إضافة الحقل', 400);
        }
    }
    static async updateField(req, res, next) {
        try {
            const field = await template_service_1.TemplateService.updateField(req.params.fieldId, req.body, req);
            return (0, response_utils_1.sendSuccess)(res, field, 'تم تعديل خصائص الحقل بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تعديل الحقل', 400);
        }
    }
    static async deleteField(req, res, next) {
        try {
            const result = await template_service_1.TemplateService.deleteField(req.params.fieldId, req);
            return (0, response_utils_1.sendSuccess)(res, result, 'تم حذف الحقل بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل حذف الحقل', 400);
        }
    }
}
exports.TemplateController = TemplateController;
