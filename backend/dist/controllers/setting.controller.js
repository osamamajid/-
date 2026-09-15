"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingController = void 0;
const setting_service_1 = require("../services/setting.service");
const response_utils_1 = require("../utils/response.utils");
class SettingController {
    static async getSettings(req, res, next) {
        try {
            const data = await setting_service_1.SettingService.getSettings();
            return (0, response_utils_1.sendSuccess)(res, data, 'تم استرجاع الإعدادات بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل جلب الإعدادات', 400);
        }
    }
    static async updateSettings(req, res, next) {
        try {
            const data = await setting_service_1.SettingService.updateSettings(req.body, req);
            return (0, response_utils_1.sendSuccess)(res, data, 'تم تحديث الإعدادات بنجاح');
        }
        catch (error) {
            return (0, response_utils_1.sendError)(res, error.message || 'فشل تحديث الإعدادات', 400);
        }
    }
}
exports.SettingController = SettingController;
