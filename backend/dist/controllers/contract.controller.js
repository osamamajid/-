"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const contract_service_1 = require("../services/contract.service");
const response_utils_1 = require("../utils/response.utils");
const audit_service_1 = require("../services/audit.service");
class ContractController {
    static async getContracts(req, res, next) {
        try {
            const result = await contract_service_1.ContractService.getContracts(req.query);
            return (0, response_utils_1.sendSuccess)(res, result.contracts, 'تم استرجاع قائمة العقود بنجاح', 200, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل جلب قائمة العقود', 400);
        }
    }
    static async getContractById(req, res, next) {
        try {
            const contract = await contract_service_1.ContractService.getContractById(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, contract, 'تم استرجاع تفاصيل العقد بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'العقد غير موجود', 404);
        }
    }
    static async createContract(req, res, next) {
        try {
            const contract = await contract_service_1.ContractService.createContract(req.body, req);
            return (0, response_utils_1.sendSuccess)(res, contract, 'تم إنشاء العقد وتوليد رقمه بنجاح', 201);
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل إنشاء العقد', 400);
        }
    }
    static async updateContract(req, res, next) {
        try {
            const contract = await contract_service_1.ContractService.updateContract(req.params.id, req.body, req);
            return (0, response_utils_1.sendSuccess)(res, contract, 'تم تحديث بيانات العقد بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تعديل العقد', 400);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const contract = await contract_service_1.ContractService.updateStatus(req.params.id, status, req);
            return (0, response_utils_1.sendSuccess)(res, contract, 'تم تغيير حالة العقد بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تغيير حالة العقد', 400);
        }
    }
    static async archiveContract(req, res, next) {
        try {
            const contract = await contract_service_1.ContractService.archiveContract(req.params.id, req);
            return (0, response_utils_1.sendSuccess)(res, contract, 'تم أرشفة العقد بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل أرشفة العقد', 400);
        }
    }
    static async restoreContract(req, res, next) {
        try {
            const contract = await contract_service_1.ContractService.restoreContract(req.params.id, req);
            return (0, response_utils_1.sendSuccess)(res, contract, 'تمت استعادة العقد بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل استعادة العقد', 400);
        }
    }
    static async deleteContract(req, res, next) {
        try {
            const result = await contract_service_1.ContractService.softDeleteContract(req.params.id, req);
            return (0, response_utils_1.sendSuccess)(res, result, 'تم حذف العقد مؤقتاً بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل حذف العقد', 400);
        }
    }
    static async getExpiringAlerts(req, res, next) {
        try {
            const alerts = await contract_service_1.ContractService.getExpiringAlerts();
            return (0, response_utils_1.sendSuccess)(res, alerts, 'تم استرجاع تنبيهات العقود المقتربة من الانتهاء');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل استرجاع التنبيهات', 400);
        }
    }
    static async logPdfExport(req, res, next) {
        try {
            const { contractId, contractNumber } = req.body;
            await audit_service_1.AuditService.log({
                userId: req.user?.userId,
                action: 'PDF_EXPORT_OR_PRINT',
                entity: 'Contract',
                entityId: contractId,
                details: { contractNumber, action: 'طباعة أو تصدير PDF' },
                req,
            });
            return (0, response_utils_1.sendSuccess)(res, { success: true }, 'تم تسجيل عملية التصدير');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, 'خطأ في تسجيل العملية', 500);
        }
    }
}
exports.ContractController = ContractController;
