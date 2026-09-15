"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const response_utils_1 = require("../utils/response.utils");
class DashboardController {
    static async getStats(req, res, next) {
        try {
            const stats = await dashboard_service_1.DashboardService.getStats();
            return (0, response_utils_1.sendSuccess)(res, stats, 'تم استرجاع إحصائيات لوحة التحكم بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل جلب إحصائيات لوحة التحكم', 400);
        }
    }
    static async getMonthlyTrends(req, res, next) {
        try {
            const trends = await dashboard_service_1.DashboardService.getMonthlyTrends();
            return (0, response_utils_1.sendSuccess)(res, trends, 'تم استرجاع المخطط الشهري للعقود بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل جلب المخطط الشهري', 400);
        }
    }
}
exports.DashboardController = DashboardController;
