"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
const response_utils_1 = require("../utils/response.utils");
class ReportController {
    static async getContractsReport(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getContractsReport(req.query);
            return (0, response_utils_1.sendSuccess)(res, data, 'تم استخراج تقرير العقود بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل استخراج التقرير', 400);
        }
    }
    static async getRevenuesReport(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getRevenuesReport(req.query);
            return (0, response_utils_1.sendSuccess)(res, data, 'تم استخراج تقرير الإيرادات بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل استخراج تقرير الإيرادات', 400);
        }
    }
    static async getCustomersReport(req, res, next) {
        try {
            const data = await report_service_1.ReportService.getCustomersReport();
            return (0, response_utils_1.sendSuccess)(res, data, 'تم استخراج تقرير العملاء بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل استخراج تقرير العملاء', 400);
        }
    }
}
exports.ReportController = ReportController;
