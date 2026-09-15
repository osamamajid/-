import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

// جلب الإعدادات متاح لجميع المستخدمين الموثقين لعرض معلومات الشركة في العقود والطباعة
router.get('/', SettingController.getSettings);

// تعديل الإعدادات للمسؤول فقط
router.put('/', requireRoles('ADMIN'), SettingController.updateSettings);

export default router;
