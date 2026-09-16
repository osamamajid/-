import { z } from 'zod';

const safeString = (message: string, min = 1, max = 2000) =>
  z.string({ invalid_type_error: message, required_error: message })
    .trim()
    .min(min, message)
    .max(max, message)
    .refine((value) => !/[<>]/.test(value), 'يحتوي الحقل على رموز غير مسموحة');

const safeOptionalString = (message: string, min = 0, max = 2000) =>
  z.string({ invalid_type_error: message }).trim().min(min, message).max(max, message).optional().nullable();

export const createContractSchema = z.object({
  body: z.object({
    contractTypeId: safeString('نوع العقد مطلوب', 1, 100),
    customerId: safeString('العميل مطلوب', 1, 100),
    issueDate: z.preprocess((val) => (val === '' ? undefined : val), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ التحرير غير صحيح').optional()),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بداية العقد غير صحيح').min(1, 'تاريخ بداية العقد مطلوب'),
    endDate: z.preprocess((val) => (val === '' ? null : val), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ انتهاء العقد غير صحيح').optional().nullable()),
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED']).default('ACTIVE'),
    totalAmount: z.number({ invalid_type_error: 'قيمة العقد يجب أن تكون رقماً' }).finite('قيمة العقد غير صحيحة').nonnegative('قيمة العقد يجب أن تكون رقماً موجباً').max(1000000000000, 'قيمة العقد تتجاوز الحد المسموح').default(0),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'INSTALLMENT']).default('CASH'),
    notes: safeOptionalString('ملاحظات العقد غير صالحة', 0, 5000),
    values: z.record(z.any()).optional().default({}),
  }),
});

export const updateContractSchema = z.object({
  body: z.object({
    contractTypeId: safeString('نوع العقد غير صحيح', 1, 100).optional(),
    customerId: safeString('العميل غير صحيح', 1, 100).optional(),
    issueDate: z.preprocess((val) => (val === '' ? undefined : val), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ التحرير غير صحيح').optional()),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بداية العقد غير صحيح').optional(),
    endDate: z.preprocess((val) => (val === '' ? null : val), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ انتهاء العقد غير صحيح').optional().nullable()),
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
    totalAmount: z.number({ invalid_type_error: 'قيمة العقد يجب أن تكون رقماً' }).finite('قيمة العقد غير صحيحة').nonnegative('قيمة العقد يجب أن تكون رقماً موجباً').max(1000000000000, 'قيمة العقد تتجاوز الحد المسموح').optional(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'INSTALLMENT']).optional(),
    notes: safeOptionalString('ملاحظات العقد غير صالحة', 0, 5000),
    values: z.record(z.any()).optional(),
  }),
});
