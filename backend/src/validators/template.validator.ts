import { z } from 'zod';

const safeTemplateText = (message: string, min = 1, max = 500) =>
  z.string({ invalid_type_error: message, required_error: message })
    .trim()
    .min(min, message)
    .max(max, message)
    .refine((value) => !/[<>]/.test(value), 'يحتوي الحقل على رموز غير مسموحة');

export const createContractTypeSchema = z.object({
  body: z.object({
    name: safeTemplateText('اسم نوع العقد مطلوب', 2, 120),
    code: z.string({ invalid_type_error: 'رمز نوع العقد غير صحيح' }).trim().min(2, 'رمز نوع العقد مطلوب').max(40, 'رمز نوع العقد طويل جداً').regex(/^[A-Za-z0-9_-]+$/, 'رمز نوع العقد يسمح فقط بالأحرف والأرقام وـ و -'),
    description: z.string({ invalid_type_error: 'الوصف غير صحيح' }).trim().max(2000, 'الوصف طويل جداً').optional().nullable(),
    icon: z.string({ invalid_type_error: 'الأيقونة غير صحيحة' }).trim().max(100, 'اسم الأيقونة طويل جداً').optional().nullable(),
    termsAndConditions: z.string({ invalid_type_error: 'الشروط غير صحيحة' }).trim().max(5000, 'الشروط طويلة جداً').optional().nullable(),
  }),
});

export const updateContractTypeSchema = z.object({
  body: z.object({
    name: safeTemplateText('اسم نوع العقد مطلوب', 2, 120).optional(),
    description: z.string({ invalid_type_error: 'الوصف غير صحيح' }).trim().max(2000, 'الوصف طويل جداً').optional().nullable(),
    icon: z.string({ invalid_type_error: 'الأيقونة غير صحيحة' }).trim().max(100, 'اسم الأيقونة طويل جداً').optional().nullable(),
    isActive: z.boolean().optional(),
    termsAndConditions: z.string({ invalid_type_error: 'الشروط غير صحيحة' }).trim().max(5000, 'الشروط طويلة جداً').optional().nullable(),
  }),
});

export const addFieldSchema = z.object({
  body: z.object({
    fieldKey: z.string({ invalid_type_error: 'مفتاح الحقل غير صحيح' }).trim().min(2, 'مفتاح الحقل مطلوب').max(80, 'مفتاح الحقل طويل جداً').regex(/^[a-zA-Z0-9_]+$/, 'مفتاح الحقل يسمح فقط بالأحرف والأرقام والـ _'),
    label: safeTemplateText('اسم وعنوان الحقل مطلوب', 2, 150),
    fieldType: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA', 'CHECKBOX']),
    isRequired: z.boolean().default(false),
    options: z.array(z.string({ invalid_type_error: 'خيارات الحقل غير صحيحة' }).trim().max(200, 'خيار طويل جداً')).optional().nullable(),
    section: z.enum(['parties', 'details', 'financial', 'terms']).default('details'),
    orderIndex: z.number({ invalid_type_error: 'ترتيب الحقل يجب أن يكون رقماً' }).int('ترتيب الحقل يجب أن يكون صحيحاً').default(0),
    placeholder: z.string({ invalid_type_error: 'النص التوضيحي غير صحيح' }).trim().max(200, 'النص التوضيحي طويل جداً').optional().nullable(),
  }),
});

export const updateFieldSchema = z.object({
  body: z.object({
    label: safeTemplateText('اسم الحقل مطلوب', 2, 150).optional(),
    fieldType: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA', 'CHECKBOX']).optional(),
    isRequired: z.boolean().optional(),
    options: z.array(z.string({ invalid_type_error: 'خيارات الحقل غير صحيحة' }).trim().max(200, 'خيار طويل جداً')).optional().nullable(),
    section: z.enum(['parties', 'details', 'financial', 'terms']).optional(),
    orderIndex: z.number({ invalid_type_error: 'ترتيب الحقل يجب أن يكون رقماً' }).int('ترتيب الحقل يجب أن يكون صحيحاً').optional(),
    placeholder: z.string({ invalid_type_error: 'النص التوضيحي غير صحيح' }).trim().max(200, 'النص التوضيحي طويل جداً').optional().nullable(),
  }),
});
