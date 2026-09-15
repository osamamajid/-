"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const template_controller_1 = require("../controllers/template.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const template_validator_1 = require("../validators/template.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// الكل يستطيع رؤية أنواع العقود لإنشاء العقود
router.get('/', template_controller_1.TemplateController.getContractTypes);
router.get('/:id', template_controller_1.TemplateController.getContractTypeById);
// بناء وتعديل النماذج والحقول للمسؤول فقط
router.post('/', (0, rbac_middleware_1.requireRoles)('ADMIN'), (0, validate_middleware_1.validateRequest)(template_validator_1.createContractTypeSchema), template_controller_1.TemplateController.createContractType);
router.put('/:id', (0, rbac_middleware_1.requireRoles)('ADMIN'), (0, validate_middleware_1.validateRequest)(template_validator_1.updateContractTypeSchema), template_controller_1.TemplateController.updateContractType);
router.post('/:templateId/fields', (0, rbac_middleware_1.requireRoles)('ADMIN'), (0, validate_middleware_1.validateRequest)(template_validator_1.addFieldSchema), template_controller_1.TemplateController.addField);
router.put('/fields/:fieldId', (0, rbac_middleware_1.requireRoles)('ADMIN'), (0, validate_middleware_1.validateRequest)(template_validator_1.updateFieldSchema), template_controller_1.TemplateController.updateField);
router.delete('/fields/:fieldId', (0, rbac_middleware_1.requireRoles)('ADMIN'), template_controller_1.TemplateController.deleteField);
exports.default = router;
