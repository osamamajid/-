"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContractSchema = exports.createContractSchema = void 0;
const zod_1 = require("zod");
const safeString = (message, min = 1, max = 2000) => zod_1.z.string({ invalid_type_error: message, required_error: message })
    .trim()
    .min(min, message)
    .max(max, message)
    .refine((value) => !/[<>]/.test(value), 'يحتوي الحقل على رموز غير مسموحة');
const safeOptionalString = (message, min = 0, max = 2000) => zod_1.z.string({ invalid_type_error: message }).trim().min(min, message).max(max, message).optional().nullable();
exports.createContractSchema = zod_1.z.object({
    body: zod_1.z.object({
        contractTypeId: safeString('نوع العقد مطلوب', 1, 100),
        customerId: safeString('العميل مطلوب', 1, 100),
        issueDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ التحرير غير صحيح').optional(),
        startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بداية العقد غير صحيح').min(1, 'تاريخ بداية العقد مطلوب'),
        endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ انتهاء العقد غير صحيح').optional().nullable(),
        status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED']).default('ACTIVE'),
        totalAmount: zod_1.z.number({ invalid_type_error: 'قيمة العقد يجب أن تكون رقماً' }).finite('قيمة العقد غير صحيحة').nonnegative('قيمة العقد يجب أن تكون رقماً موجباً').max(1000000000000, 'قيمة العقد تتجاوز الحد المسموح').default(0),
        paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'INSTALLMENT']).default('CASH'),
        notes: safeOptionalString('ملاحظات العقد غير صالحة', 0, 5000),
        values: zod_1.z.record(zod_1.z.any()).optional().default({}),
    }),
});
exports.updateContractSchema = zod_1.z.object({
    body: zod_1.z.object({
        contractTypeId: safeString('نوع العقد غير صحيح', 1, 100).optional(),
        customerId: safeString('العميل غير صحيح', 1, 100).optional(),
        issueDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ التحرير غير صحيح').optional(),
        startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بداية العقد غير صحيح').optional(),
        endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ انتهاء العقد غير صحيح').optional().nullable(),
        status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED']).optional(),
        totalAmount: zod_1.z.number({ invalid_type_error: 'قيمة العقد يجب أن تكون رقماً' }).finite('قيمة العقد غير صحيحة').nonnegative('قيمة العقد يجب أن تكون رقماً موجباً').max(1000000000000, 'قيمة العقد تتجاوز الحد المسموح').optional(),
        paymentMethod: zod_1.z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'INSTALLMENT']).optional(),
        notes: safeOptionalString('ملاحظات العقد غير صالحة', 0, 5000),
        values: zod_1.z.record(zod_1.z.any()).optional(),
    }),
});
