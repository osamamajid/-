"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setting_controller_1 = require("../controllers/setting.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// جلب الإعدادات متاح لجميع المستخدمين الموثقين لعرض معلومات الشركة في العقود والطباعة
router.get('/', setting_controller_1.SettingController.getSettings);
// تعديل الإعدادات للمسؤول فقط
router.put('/', (0, rbac_middleware_1.requireRoles)('ADMIN'), setting_controller_1.SettingController.updateSettings);
exports.default = router;
