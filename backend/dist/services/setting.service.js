"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const audit_service_1 = require("./audit.service");
class SettingService {
    static async getSettings() {
        const settings = await prisma_1.default.setting.findMany();
        const map = {};
        settings.forEach((s) => {
            map[s.key] = s.value;
        });
        return {
            settingsList: settings,
            settingsMap: map,
        };
    }
    static async updateSettings(data, req) {
        for (const [key, value] of Object.entries(data)) {
            await prisma_1.default.setting.upsert({
                where: { key },
                update: { value: String(value) },
                create: {
                    key,
                    value: String(value),
                    group: key.startsWith('company_') ? 'company' : 'general',
                },
            });
        }
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'SETTINGS_UPDATE',
            entity: 'Setting',
            entityId: 'global',
            details: data,
            req,
        });
        return this.getSettings();
    }
}
exports.SettingService = SettingService;
