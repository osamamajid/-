"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/track', audit_controller_1.AuditController.trackActivity);
router.use((0, rbac_middleware_1.requireRoles)('ADMIN')); // سجل العمليات متاح للمسؤول فقط
router.get('/', audit_controller_1.AuditController.getLogs);
exports.default = router;
