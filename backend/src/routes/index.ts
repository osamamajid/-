import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import contractRoutes from './contract.routes';
import templateRoutes from './template.routes';
import dashboardRoutes from './dashboard.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';
import auditRoutes from './audit.routes';
import settingRoutes from './setting.routes';
import activityRoutes from './activity.routes';
import demoRoutes from './demo.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/contracts', contractRoutes);
apiRouter.use('/contract-types', templateRoutes);
apiRouter.use('/templates', templateRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/activity', activityRoutes);
apiRouter.use('/settings', settingRoutes);
apiRouter.use('/demo', demoRoutes);

export default apiRouter;
