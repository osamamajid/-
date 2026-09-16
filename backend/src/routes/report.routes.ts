import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { demoProtection } from '../middleware/demo.middleware';

const router = Router();

router.use(authenticate);
router.use(demoProtection);
router.use(requirePermission('reports:view'));

router.get('/contracts', ReportController.getContractsReport);
router.get('/revenues', ReportController.getRevenuesReport);
router.get('/customers', ReportController.getCustomersReport);

export default router;
