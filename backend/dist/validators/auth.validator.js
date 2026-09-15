"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
        password: zod_1.z.string().min(6, 'كلمة المرور يجب أن تكون 6 خانات على الأقل'),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
        newPassword: zod_1.z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف/أرقام على الأقل'),
    }),
});
