"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use((0, rbac_middleware_1.requireRoles)('ADMIN')); // فقط المسؤول يستطيع إدارة المستخدمين
router.get('/', user_controller_1.UserController.getUsers);
router.get('/roles', user_controller_1.UserController.getRoles);
router.post('/', (0, validate_middleware_1.validateRequest)(user_validator_1.createUserSchema), user_controller_1.UserController.createUser);
router.put('/:id', (0, validate_middleware_1.validateRequest)(user_validator_1.updateUserSchema), user_controller_1.UserController.updateUser);
router.patch('/:id/toggle-status', user_controller_1.UserController.toggleStatus);
router.delete('/:id', user_controller_1.UserController.deleteUser);
exports.default = router;
