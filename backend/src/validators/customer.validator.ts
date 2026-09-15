import { z } from 'zod';

const safeText = (message: string, min = 1, max = 200) =>
  z.string({ invalid_type_error: message, required_error: message })
    .trim()
    .min(min, message)
    .max(max, message)
    .refine((value) => !/[<>]/.test(value), 'يحتوي الحقل على رموز غير مسموحة');

const safeOptionalText = (message: string, max = 500) =>
  z.string({ invalid_type_error: message }).trim().max(max, message).optional().nullable();

export const createCustomerSchema = z.object({
  body: z.object({
    fullName: safeText('الاسم الكامل مطلوب ويجب أن يكون 3 أحرف على الأقل', 3, 120).refine((value) => /^[A-Za-z\u0600-\u06FF\u0750-\u077F\s.'-]+$/.test(value), 'الاسم يجب أن يحتوي على أحرف ومسافات فقط'),
    phone: z.string({ invalid_type_error: 'رقم الهاتف غير صحيح' }).trim().regex(/^\+?[0-9\s-]{8,20}$/, 'رقم الهاتف غير صحيح').min(8, 'رقم الهاتف مطلوب'),
    nationalId: safeOptionalText('رقم الهوية غير صحيح', 40),
    address: safeOptionalText('العنوان غير صحيح', 500),
    governorate: safeOptionalText('المحافظة غير صحيحة', 100),
    notes: safeOptionalText('ملاحظات العميل غير صحيحة', 1000),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    fullName: safeText('الاسم الكامل مطلوب ويجب أن يكون 3 أحرف على الأقل', 3, 120).refine((value) => /^[A-Za-z\u0600-\u06FF\u0750-\u077F\s.'-]+$/.test(value), 'الاسم يجب أن يحتوي على أحرف ومسافات فقط').optional(),
    phone: z.string({ invalid_type_error: 'رقم الهاتف غير صحيح' }).trim().regex(/^\+?[0-9\s-]{8,20}$/, 'رقم الهاتف غير صحيح').min(8, 'رقم الهاتف مطلوب').optional(),
    nationalId: safeOptionalText('رقم الهوية غير صحيح', 40),
    address: safeOptionalText('العنوان غير صحيح', 500),
    governorate: safeOptionalText('المحافظة غير صحيحة', 100),
    notes: safeOptionalText('ملاحظات العميل غير صحيحة', 1000),
  }),
});
