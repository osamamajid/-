"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contract_controller_1 = require("../controllers/contract.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const contract_validator_1 = require("../validators/contract.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// تنبيهات انتهاء العقود
router.get('/expiring-alerts', (0, rbac_middleware_1.requirePermission)('contracts:view'), contract_controller_1.ContractController.getExpiringAlerts);
// تسجيل طباعة أو تصدير PDF
router.post('/log-export', (0, rbac_middleware_1.requirePermission)('contracts:print'), contract_controller_1.ContractController.logPdfExport);
// استعراض وتفاصيل
router.get('/', (0, rbac_middleware_1.requirePermission)('contracts:view'), contract_controller_1.ContractController.getContracts);
router.get('/:id', (0, rbac_middleware_1.requirePermission)('contracts:view'), contract_controller_1.ContractController.getContractById);
// إنشاء وتعديل
router.post('/', (0, rbac_middleware_1.requirePermission)('contracts:create'), (0, validate_middleware_1.validateRequest)(contract_validator_1.createContractSchema), contract_controller_1.ContractController.createContract);
router.put('/:id', (0, rbac_middleware_1.requirePermission)('contracts:edit'), (0, validate_middleware_1.validateRequest)(contract_validator_1.updateContractSchema), contract_controller_1.ContractController.updateContract);
router.patch('/:id/status', (0, rbac_middleware_1.requirePermission)('contracts:edit'), contract_controller_1.ContractController.updateStatus);
// أرشفة واستعادة وحذف
router.patch('/:id/archive', (0, rbac_middleware_1.requirePermission)('contracts:archive'), contract_controller_1.ContractController.archiveContract);
router.patch('/:id/restore', (0, rbac_middleware_1.requirePermission)('contracts:archive'), contract_controller_1.ContractController.restoreContract);
router.delete('/:id', (0, rbac_middleware_1.requirePermission)('contracts:delete'), contract_controller_1.ContractController.deleteContract);
exports.default = router;
