"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const audit_controller_1 = require("../controllers/audit.controller");
const router = (0, express_1.Router)();
router.post('/track', auth_middleware_1.authenticate, audit_controller_1.AuditController.trackActivity);
exports.default = router;
