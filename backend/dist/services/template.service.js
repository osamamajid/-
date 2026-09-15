"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const audit_service_1 = require("./audit.service");
class TemplateService {
    static async getContractTypes() {
        const types = await prisma_1.default.contractType.findMany({
            orderBy: { createdAt: 'asc' },
            include: {
                templates: {
                    where: { isDefault: true },
                    include: {
                        fields: {
                            orderBy: { orderIndex: 'asc' },
                        },
                    },
                },
                _count: {
                    select: { contracts: true },
                },
            },
        });
        return types.map((t) => {
            const defaultTemplate = t.templates[0] || null;
            return {
                id: t.id,
                name: t.name,
                code: t.code,
                description: t.description,
                icon: t.icon,
                isActive: t.isActive,
                contractsCount: t._count.contracts,
                templateId: defaultTemplate?.id || null,
                termsAndConditions: defaultTemplate?.termsAndConditions || '',
                fieldsCount: defaultTemplate?.fields.length || 0,
                fields: defaultTemplate?.fields.map((f) => ({
                    ...f,
                    options: f.options ? JSON.parse(f.options) : [],
                })) || [],
            };
        });
    }
    static async getContractTypeById(id) {
        const type = await prisma_1.default.contractType.findUnique({
            where: { id },
            include: {
                templates: {
                    include: {
                        fields: {
                            orderBy: { orderIndex: 'asc' },
                        },
                    },
                },
            },
        });
        if (!type) {
            throw new Error('نوع العقد غير موجود');
        }
        const defaultTemplate = type.templates[0];
        return {
            id: type.id,
            name: type.name,
            code: type.code,
            description: type.description,
            icon: type.icon,
            isActive: type.isActive,
            templateId: defaultTemplate?.id,
            termsAndConditions: defaultTemplate?.termsAndConditions,
            fields: defaultTemplate?.fields.map((f) => ({
                ...f,
                options: f.options ? JSON.parse(f.options) : [],
            })) || [],
        };
    }
    static async createContractType(data, req) {
        const existing = await prisma_1.default.contractType.findFirst({
            where: {
                OR: [{ code: data.code.toUpperCase() }, { name: data.name }],
            },
        });
        if (existing) {
            throw new Error('اسم نوع العقد أو الرمز التعريفي مستخدم بالفعل');
        }
        const type = await prisma_1.default.contractType.create({
            data: {
                name: data.name,
                code: data.code.toUpperCase(),
                description: data.description || null,
                icon: data.icon || 'FileText',
                templates: {
                    create: {
                        name: `نموذج ${data.name} القياسي`,
                        termsAndConditions: data.termsAndConditions || 'بنود وشروط العقد المعتمدة لدى الطرفين...',
                        isDefault: true,
                    },
                },
            },
            include: {
                templates: true,
            },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_TYPE_CREATE',
            entity: 'ContractType',
            entityId: type.id,
            details: { name: type.name, code: type.code },
            req,
        });
        return type;
    }
    static async updateContractType(id, data, req) {
        const type = await prisma_1.default.contractType.findUnique({
            where: { id },
            include: { templates: { where: { isDefault: true } } },
        });
        if (!type) {
            throw new Error('نوع العقد غير موجود');
        }
        const updated = await prisma_1.default.contractType.update({
            where: { id },
            data: {
                name: data.name ?? type.name,
                description: data.description !== undefined ? data.description : type.description,
                icon: data.icon !== undefined ? data.icon : type.icon,
                isActive: data.isActive !== undefined ? data.isActive : type.isActive,
            },
        });
        if (data.termsAndConditions !== undefined && type.templates[0]) {
            await prisma_1.default.contractTemplate.update({
                where: { id: type.templates[0].id },
                data: { termsAndConditions: data.termsAndConditions },
            });
        }
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_TYPE_UPDATE',
            entity: 'ContractType',
            entityId: id,
            details: data,
            req,
        });
        return updated;
    }
    static async addField(templateId, data, req) {
        const template = await prisma_1.default.contractTemplate.findUnique({
            where: { id: templateId },
            include: { fields: true },
        });
        if (!template) {
            throw new Error('قالب العقد غير موجود');
        }
        const existingKey = template.fields.some((f) => f.fieldKey === data.fieldKey);
        if (existingKey) {
            throw new Error('مفتاح الحقل (Field Key) موجود بالفعل في هذا النموذج');
        }
        const maxOrder = template.fields.reduce((max, f) => Math.max(max, f.orderIndex), 0);
        const field = await prisma_1.default.contractField.create({
            data: {
                templateId,
                fieldKey: data.fieldKey,
                label: data.label,
                fieldType: data.fieldType,
                isRequired: data.isRequired ?? false,
                options: data.options ? JSON.stringify(data.options) : null,
                section: data.section || 'details',
                orderIndex: data.orderIndex !== undefined ? data.orderIndex : maxOrder + 1,
                placeholder: data.placeholder || null,
            },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_FIELD_ADD',
            entity: 'ContractField',
            entityId: field.id,
            details: { templateId, fieldKey: field.fieldKey, label: field.label },
            req,
        });
        return {
            ...field,
            options: field.options ? JSON.parse(field.options) : [],
        };
    }
    static async updateField(fieldId, data, req) {
        const existing = await prisma_1.default.contractField.findUnique({
            where: { id: fieldId },
        });
        if (!existing) {
            throw new Error('الحقل غير موجود');
        }
        const updated = await prisma_1.default.contractField.update({
            where: { id: fieldId },
            data: {
                label: data.label ?? existing.label,
                fieldType: data.fieldType ?? existing.fieldType,
                isRequired: data.isRequired !== undefined ? data.isRequired : existing.isRequired,
                options: data.options !== undefined ? JSON.stringify(data.options) : existing.options,
                section: data.section ?? existing.section,
                orderIndex: data.orderIndex !== undefined ? data.orderIndex : existing.orderIndex,
                placeholder: data.placeholder !== undefined ? data.placeholder : existing.placeholder,
            },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_FIELD_UPDATE',
            entity: 'ContractField',
            entityId: fieldId,
            details: data,
            req,
        });
        return {
            ...updated,
            options: updated.options ? JSON.parse(updated.options) : [],
        };
    }
    static async deleteField(fieldId, req) {
        const existing = await prisma_1.default.contractField.findUnique({
            where: { id: fieldId },
        });
        if (!existing) {
            throw new Error('الحقل غير موجود');
        }
        await prisma_1.default.contractField.delete({
            where: { id: fieldId },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_FIELD_DELETE',
            entity: 'ContractField',
            entityId: fieldId,
            details: { label: existing.label, fieldKey: existing.fieldKey },
            req,
        });
        return { message: 'تم حذف الحقل بنجاح' };
    }
}
exports.TemplateService = TemplateService;
