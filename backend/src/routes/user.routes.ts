import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { demoProtection } from '../middleware/demo.middleware';

const router = Router();

router.use(authenticate);
router.use(demoProtection);
router.use(requireRoles('ADMIN')); // فقط المسؤول يستطيع إدارة المستخدمين

router.get('/', UserController.getUsers);
router.get('/roles', UserController.getRoles);
router.post('/', validateRequest(createUserSchema), UserController.createUser);
router.put('/:id', validateRequest(updateUserSchema), UserController.updateUser);
router.patch('/:id/toggle-status', UserController.toggleStatus);
router.delete('/:id', UserController.deleteUser);

export default router;
