import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { demoProtection } from '../middleware/demo.middleware';

const router = Router();

router.use(authenticate);
router.use(demoProtection);
router.post('/track', AuditController.trackActivity);
router.use(requireRoles('ADMIN')); // سجل العمليات متاح للمسؤول فقط

router.get('/', AuditController.getLogs);

export default router;
