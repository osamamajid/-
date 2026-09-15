import prisma from '../config/prisma';
import { AuditService } from './audit.service';
import { Request } from 'express';

export class SettingService {
  static async getSettings() {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return {
      settingsList: settings,
      settingsMap: map,
    };
  }

  static async updateSettings(data: Record<string, string>, req?: Request) {
    for (const [key, value] of Object.entries(data)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          group: key.startsWith('company_') ? 'company' : 'general',
        },
      });
    }

    await AuditService.log({
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
