import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';
import { demoProtection } from '../middleware/demo.middleware';

const router = Router();

router.use(authenticate);
router.use(demoProtection);

router.get('/', requirePermission('customers:view'), CustomerController.getCustomers);
router.get('/:id', requirePermission('customers:view'), CustomerController.getCustomerById);
router.post('/', requirePermission('customers:create'), validateRequest(createCustomerSchema), CustomerController.createCustomer);
router.put('/:id', requirePermission('customers:edit'), validateRequest(updateCustomerSchema), CustomerController.updateCustomer);
router.delete('/:id', requirePermission('customers:delete'), CustomerController.deleteCustomer);

export default router;
