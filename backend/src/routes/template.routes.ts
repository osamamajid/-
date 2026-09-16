import { Router } from 'express';
import { TemplateController } from '../controllers/template.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createContractTypeSchema,
  updateContractTypeSchema,
  addFieldSchema,
  updateFieldSchema,
} from '../validators/template.validator';
import { demoProtection } from '../middleware/demo.middleware';

const router = Router();

router.use(authenticate);
router.use(demoProtection);

// الكل يستطيع رؤية أنواع العقود لإنشاء العقود
router.get('/', TemplateController.getContractTypes);
router.get('/:id', TemplateController.getContractTypeById);

// بناء وتعديل النماذج والحقول للمسؤول فقط
router.post('/', requireRoles('ADMIN'), validateRequest(createContractTypeSchema), TemplateController.createContractType);
router.put('/:id', requireRoles('ADMIN'), validateRequest(updateContractTypeSchema), TemplateController.updateContractType);
router.post('/:templateId/fields', requireRoles('ADMIN'), validateRequest(addFieldSchema), TemplateController.addField);
router.put('/fields/:fieldId', requireRoles('ADMIN'), validateRequest(updateFieldSchema), TemplateController.updateField);
router.delete('/fields/:fieldId', requireRoles('ADMIN'), TemplateController.deleteField);

export default router;
