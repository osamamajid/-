"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFieldSchema = exports.addFieldSchema = exports.updateContractTypeSchema = exports.createContractTypeSchema = void 0;
const zod_1 = require("zod");
const safeTemplateText = (message, min = 1, max = 500) => zod_1.z.string({ invalid_type_error: message, required_error: message })
    .trim()
    .min(min, message)
    .max(max, message)
    .refine((value) => !/[<>]/.test(value), 'يحتوي الحقل على رموز غير مسموحة');
exports.createContractTypeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: safeTemplateText('اسم نوع العقد مطلوب', 2, 120),
        code: zod_1.z.string({ invalid_type_error: 'رمز نوع العقد غير صحيح' }).trim().min(2, 'رمز نوع العقد مطلوب').max(40, 'رمز نوع العقد طويل جداً').regex(/^[A-Za-z0-9_-]+$/, 'رمز نوع العقد يسمح فقط بالأحرف والأرقام وـ و -'),
        description: zod_1.z.string({ invalid_type_error: 'الوصف غير صحيح' }).trim().max(2000, 'الوصف طويل جداً').optional().nullable(),
        icon: zod_1.z.string({ invalid_type_error: 'الأيقونة غير صحيحة' }).trim().max(100, 'اسم الأيقونة طويل جداً').optional().nullable(),
        termsAndConditions: zod_1.z.string({ invalid_type_error: 'الشروط غير صحيحة' }).trim().max(5000, 'الشروط طويلة جداً').optional().nullable(),
    }),
});
exports.updateContractTypeSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: safeTemplateText('اسم نوع العقد مطلوب', 2, 120).optional(),
        description: zod_1.z.string({ invalid_type_error: 'الوصف غير صحيح' }).trim().max(2000, 'الوصف طويل جداً').optional().nullable(),
        icon: zod_1.z.string({ invalid_type_error: 'الأيقونة غير صحيحة' }).trim().max(100, 'اسم الأيقونة طويل جداً').optional().nullable(),
        isActive: zod_1.z.boolean().optional(),
        termsAndConditions: zod_1.z.string({ invalid_type_error: 'الشروط غير صحيحة' }).trim().max(5000, 'الشروط طويلة جداً').optional().nullable(),
    }),
});
exports.addFieldSchema = zod_1.z.object({
    body: zod_1.z.object({
        fieldKey: zod_1.z.string({ invalid_type_error: 'مفتاح الحقل غير صحيح' }).trim().min(2, 'مفتاح الحقل مطلوب').max(80, 'مفتاح الحقل طويل جداً').regex(/^[a-zA-Z0-9_]+$/, 'مفتاح الحقل يسمح فقط بالأحرف والأرقام والـ _'),
        label: safeTemplateText('اسم وعنوان الحقل مطلوب', 2, 150),
        fieldType: zod_1.z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA', 'CHECKBOX']),
        isRequired: zod_1.z.boolean().default(false),
        options: zod_1.z.array(zod_1.z.string({ invalid_type_error: 'خيارات الحقل غير صحيحة' }).trim().max(200, 'خيار طويل جداً')).optional().nullable(),
        section: zod_1.z.enum(['parties', 'details', 'financial', 'terms']).default('details'),
        orderIndex: zod_1.z.number({ invalid_type_error: 'ترتيب الحقل يجب أن يكون رقماً' }).int('ترتيب الحقل يجب أن يكون صحيحاً').default(0),
        placeholder: zod_1.z.string({ invalid_type_error: 'النص التوضيحي غير صحيح' }).trim().max(200, 'النص التوضيحي طويل جداً').optional().nullable(),
    }),
});
exports.updateFieldSchema = zod_1.z.object({
    body: zod_1.z.object({
        label: safeTemplateText('اسم الحقل مطلوب', 2, 150).optional(),
        fieldType: zod_1.z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA', 'CHECKBOX']).optional(),
        isRequired: zod_1.z.boolean().optional(),
        options: zod_1.z.array(zod_1.z.string({ invalid_type_error: 'خيارات الحقل غير صحيحة' }).trim().max(200, 'خيار طويل جداً')).optional().nullable(),
        section: zod_1.z.enum(['parties', 'details', 'financial', 'terms']).optional(),
        orderIndex: zod_1.z.number({ invalid_type_error: 'ترتيب الحقل يجب أن يكون رقماً' }).int('ترتيب الحقل يجب أن يكون صحيحاً').optional(),
        placeholder: zod_1.z.string({ invalid_type_error: 'النص التوضيحي غير صحيح' }).trim().max(200, 'النص التوضيحي طويل جداً').optional().nullable(),
    }),
});
