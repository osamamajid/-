import { Router } from 'express';
import { ContractController } from '../controllers/contract.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission, requireRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createContractSchema, updateContractSchema } from '../validators/contract.validator';
import { demoProtection } from '../middleware/demo.middleware';

const router = Router();

router.use(authenticate);
router.use(demoProtection);

// تنبيهات انتهاء العقود
router.get('/expiring-alerts', requirePermission('contracts:view'), ContractController.getExpiringAlerts);

// تسجيل طباعة أو تصدير PDF
router.post('/log-export', requirePermission('contracts:print'), ContractController.logPdfExport);

// استعراض وتفاصيل
router.get('/', requirePermission('contracts:view'), ContractController.getContracts);
router.get('/:id', requirePermission('contracts:view'), ContractController.getContractById);

// إنشاء وتعديل
router.post('/', requirePermission('contracts:create'), validateRequest(createContractSchema), ContractController.createContract);
router.put('/:id', requirePermission('contracts:edit'), validateRequest(updateContractSchema), ContractController.updateContract);
router.patch('/:id/status', requirePermission('contracts:edit'), ContractController.updateStatus);

// أرشفة واستعادة وحذف
router.patch('/:id/archive', requirePermission('contracts:archive'), ContractController.archiveContract);
router.patch('/:id/restore', requirePermission('contracts:archive'), ContractController.restoreContract);
router.delete('/:id', requirePermission('contracts:delete'), ContractController.deleteContract);

export default router;
