import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { demoProtection } from '../middleware/demo.middleware';

const router = Router();

router.use(authenticate);
router.use(demoProtection);

router.get('/stats', DashboardController.getStats);
router.get('/trends', DashboardController.getMonthlyTrends);

export default router;
