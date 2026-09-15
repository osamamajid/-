import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);
router.post('/track', AuditController.trackActivity);
router.use(requireRoles('ADMIN')); // سجل العمليات متاح للمسؤول فقط

router.get('/', AuditController.getLogs);

export default router;
