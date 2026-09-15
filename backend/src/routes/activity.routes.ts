import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuditController } from '../controllers/audit.controller';

const router = Router();

router.post('/track', authenticate, AuditController.trackActivity);

export default router;
