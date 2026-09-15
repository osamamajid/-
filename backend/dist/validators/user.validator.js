"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const safeUserString = (message, min = 1, max = 120) => zod_1.z.string({ invalid_type_error: message, required_error: message })
    .trim()
    .min(min, message)
    .max(max, message)
    .regex(/^[^<>]+$/, 'يحتوي الحقل على رموز غير مسموحة');
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: safeUserString('اسم المستخدم يجب أن يكون 3 أحرف على الأقل', 3, 50).regex(/^[a-zA-Z0-9_\.\-]+$/, 'اسم المستخدم يسمح فقط بالحروف والأرقام والـ _ و . و -'),
        email: zod_1.z.string({ invalid_type_error: 'البريد الإلكتروني غير صحيح' }).trim().email('صيغة البريد الإلكتروني غير صحيحة').max(120, 'البريد الإلكتروني طويل جداً'),
        password: zod_1.z.string({ invalid_type_error: 'كلمة المرور غير صحيحة' }).min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف').max(128, 'كلمة المرور طويلة جداً'),
        fullName: safeUserString('الاسم الكامل مطلوب', 3, 120).regex(/^[A-Za-z\u0600-\u06FF\u0750-\u077F\s.'-]+$/, 'الاسم يجب أن يحتوي على أحرف ومسافات فقط'),
        phone: zod_1.z.string({ invalid_type_error: 'رقم الهاتف غير صحيح' }).trim().regex(/^\+?[0-9\s-]{8,20}$/, 'رقم الهاتف غير صحيح').optional().nullable(),
        roleId: safeUserString('الدور مطلوب', 1, 100),
        mustChangePassword: zod_1.z.boolean().optional().default(false),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: safeUserString('الاسم الكامل مطلوب', 3, 120).regex(/^[A-Za-z\u0600-\u06FF\u0750-\u077F\s.'-]+$/, 'الاسم يجب أن يحتوي على أحرف ومسافات فقط').optional(),
        email: zod_1.z.string({ invalid_type_error: 'البريد الإلكتروني غير صحيح' }).trim().email('صيغة البريد الإلكتروني غير صحيحة').max(120, 'البريد الإلكتروني طويل جداً').optional(),
        phone: zod_1.z.string({ invalid_type_error: 'رقم الهاتف غير صحيح' }).trim().regex(/^\+?[0-9\s-]{8,20}$/, 'رقم الهاتف غير صحيح').optional().nullable(),
        roleId: safeUserString('الدور غير صحيح', 1, 100).optional(),
        password: zod_1.z.string({ invalid_type_error: 'كلمة المرور غير صحيحة' }).min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف').max(128, 'كلمة المرور طويلة جداً').optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
