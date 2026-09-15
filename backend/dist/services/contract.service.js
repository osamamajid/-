"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const contractNumber_utils_1 = require("../utils/contractNumber.utils");
const audit_service_1 = require("./audit.service");
const contractValue_utils_1 = require("../utils/contractValue.utils");
class ContractService {
    static async getContracts(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortField = query.sortBy || 'createdAt';
        const sortDirection = query.sortOrder || 'desc';
        const where = {
            deletedAt: null, // استبعاد المحذوف ناعماً
        };
        // أرشيف أو نشط
        if (query.isArchived === 'true') {
            where.isArchived = true;
        }
        else if (query.isArchived === 'false' || query.isArchived === undefined) {
            where.isArchived = false;
        }
        if (query.typeId) {
            where.contractTypeId = query.typeId;
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.customerId) {
            where.customerId = query.customerId;
        }
        // البحث متعدد المعايير
        if (query.search) {
            const s = query.search.trim();
            where.OR = [
                { contractNumber: { contains: s } },
                { customer: { fullName: { contains: s } } },
                { customer: { phone: { contains: s } } },
                { customer: { nationalId: { contains: s } } },
                { notes: { contains: s } },
            ];
        }
        // فلترة التواريخ
        if (query.startDateFrom || query.startDateTo) {
            where.startDate = {};
            if (query.startDateFrom)
                where.startDate.gte = new Date(query.startDateFrom);
            if (query.startDateTo)
                where.startDate.lte = new Date(query.startDateTo);
        }
        if (query.endDateFrom || query.endDateTo) {
            where.endDate = {};
            if (query.endDateFrom)
                where.endDate.gte = new Date(query.endDateFrom);
            if (query.endDateTo)
                where.endDate.lte = new Date(query.endDateTo);
        }
        // فلترة العقود التي ستنتهي قريباً
        if (query.expiringWithinDays) {
            const days = parseInt(query.expiringWithinDays, 10);
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + days);
            where.endDate = {
                gte: now,
                lte: futureDate,
            };
            where.status = 'ACTIVE';
        }
        const [contracts, total] = await Promise.all([
            prisma_1.default.contract.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortField]: sortDirection },
                include: {
                    customer: {
                        select: {
                            id: true,
                            customerNumber: true,
                            fullName: true,
                            phone: true,
                            nationalId: true,
                            governorate: true,
                        },
                    },
                    contractType: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                            icon: true,
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            }),
            prisma_1.default.contract.count({ where }),
        ]);
        return {
            contracts,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async getContractById(id) {
        const contract = await prisma_1.default.contract.findUnique({
            where: { id },
            include: {
                customer: true,
                contractType: {
                    include: {
                        templates: {
                            where: { isDefault: true },
                            include: {
                                fields: {
                                    orderBy: { orderIndex: 'asc' },
                                },
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
                values: {
                    include: {
                        field: true,
                    },
                },
            },
        });
        if (!contract || contract.deletedAt) {
            throw new Error('العقد غير موجود أو تم حذفه');
        }
        const template = contract.contractType.templates[0];
        // خريطة بالقيم المسجلة
        const valuesMap = {};
        contract.values.forEach((v) => {
            valuesMap[v.field.fieldKey] = v.value;
        });
        return {
            ...contract,
            termsAndConditions: template?.termsAndConditions || '',
            fields: template?.fields.map((f) => ({
                ...f,
                options: f.options ? JSON.parse(f.options) : [],
                currentValue: valuesMap[f.fieldKey] || null,
            })) || [],
            valuesMap,
        };
    }
    static async createContract(data, req) {
        const contractNumber = await (0, contractNumber_utils_1.generateNextContractNumber)();
        const template = await prisma_1.default.contractTemplate.findFirst({
            where: { contractTypeId: data.contractTypeId, isDefault: true },
            include: { fields: true },
        });
        const normalizedValues = (0, contractValue_utils_1.validateAndNormalizeContractValues)(data.values, template?.fields || []);
        const contract = await prisma_1.default.contract.create({
            data: {
                contractNumber,
                contractTypeId: data.contractTypeId,
                customerId: data.customerId,
                createdById: req?.user?.userId || '',
                issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                status: data.status || 'ACTIVE',
                totalAmount: Number(data.totalAmount) || 0,
                paymentMethod: data.paymentMethod || 'CASH',
                notes: data.notes || null,
            },
        });
        // حفظ القيم الديناميكية للحقول
        if (template) {
            for (const field of template.fields) {
                if (normalizedValues[field.fieldKey] !== undefined) {
                    await prisma_1.default.contractValue.create({
                        data: {
                            contractId: contract.id,
                            fieldId: field.id,
                            value: normalizedValues[field.fieldKey],
                        },
                    });
                }
            }
        }
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_CREATE',
            entity: 'Contract',
            entityId: contract.id,
            details: { contractNumber: contract.contractNumber, totalAmount: contract.totalAmount },
            req,
        });
        return this.getContractById(contract.id);
    }
    static async updateContract(id, data, req) {
        const existing = await prisma_1.default.contract.findUnique({
            where: { id },
            include: { values: true },
        });
        if (!existing || existing.deletedAt) {
            throw new Error('العقد غير موجود');
        }
        const targetTypeId = data.contractTypeId || existing.contractTypeId;
        const template = await prisma_1.default.contractTemplate.findFirst({
            where: { contractTypeId: targetTypeId, isDefault: true },
            include: { fields: true },
        });
        const normalizedValues = data.values !== undefined
            ? (0, contractValue_utils_1.validateAndNormalizeContractValues)(data.values, template?.fields || [])
            : null;
        const updated = await prisma_1.default.contract.update({
            where: { id },
            data: {
                contractTypeId: data.contractTypeId ?? existing.contractTypeId,
                customerId: data.customerId ?? existing.customerId,
                issueDate: data.issueDate ? new Date(data.issueDate) : existing.issueDate,
                startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
                endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : existing.endDate,
                status: data.status ?? existing.status,
                totalAmount: data.totalAmount !== undefined ? Number(data.totalAmount) : existing.totalAmount,
                paymentMethod: data.paymentMethod ?? existing.paymentMethod,
                notes: data.notes !== undefined ? data.notes : existing.notes,
            },
        });
        // تحديث القيم الديناميكية
        if (template && normalizedValues) {
            for (const field of template.fields) {
                if (normalizedValues[field.fieldKey] !== undefined) {
                    await prisma_1.default.contractValue.upsert({
                        where: {
                            contractId_fieldId: {
                                contractId: id,
                                fieldId: field.id,
                            },
                        },
                        update: { value: normalizedValues[field.fieldKey] },
                        create: {
                            contractId: id,
                            fieldId: field.id,
                            value: normalizedValues[field.fieldKey],
                        },
                    });
                }
            }
        }
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_UPDATE',
            entity: 'Contract',
            entityId: id,
            details: { contractNumber: existing.contractNumber, changes: data },
            req,
        });
        return this.getContractById(id);
    }
    static async updateStatus(id, status, req) {
        const contract = await prisma_1.default.contract.findUnique({ where: { id } });
        if (!contract || contract.deletedAt)
            throw new Error('العقد غير موجود');
        const updated = await prisma_1.default.contract.update({
            where: { id },
            data: { status },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_STATUS_CHANGE',
            entity: 'Contract',
            entityId: id,
            details: { previousStatus: contract.status, newStatus: status },
            req,
        });
        return updated;
    }
    static async archiveContract(id, req) {
        const contract = await prisma_1.default.contract.findUnique({ where: { id } });
        if (!contract || contract.deletedAt)
            throw new Error('العقد غير موجود');
        const updated = await prisma_1.default.contract.update({
            where: { id },
            data: { isArchived: true },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_ARCHIVE',
            entity: 'Contract',
            entityId: id,
            details: { contractNumber: contract.contractNumber },
            req,
        });
        return updated;
    }
    static async restoreContract(id, req) {
        const contract = await prisma_1.default.contract.findUnique({ where: { id } });
        if (!contract)
            throw new Error('العقد غير موجود');
        const updated = await prisma_1.default.contract.update({
            where: { id },
            data: { isArchived: false, deletedAt: null },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_RESTORE',
            entity: 'Contract',
            entityId: id,
            details: { contractNumber: contract.contractNumber },
            req,
        });
        return updated;
    }
    static async softDeleteContract(id, req) {
        const contract = await prisma_1.default.contract.findUnique({ where: { id } });
        if (!contract)
            throw new Error('العقد غير موجود');
        const updated = await prisma_1.default.contract.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CONTRACT_DELETE_SOFT',
            entity: 'Contract',
            entityId: id,
            details: { contractNumber: contract.contractNumber },
            req,
        });
        return { message: 'تم حذف العقد مؤقتاً بنجاح' };
    }
    static async getExpiringAlerts() {
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const baseWhere = {
            deletedAt: null,
            isArchived: false,
            status: 'ACTIVE',
        };
        const [expiring7Days, expiring15Days, expiring30Days] = await Promise.all([
            prisma_1.default.contract.findMany({
                where: {
                    ...baseWhere,
                    endDate: { gte: now, lte: in7Days },
                },
                include: {
                    customer: { select: { fullName: true, phone: true } },
                    contractType: { select: { name: true, code: true } },
                },
                orderBy: { endDate: 'asc' },
            }),
            prisma_1.default.contract.findMany({
                where: {
                    ...baseWhere,
                    endDate: { gte: now, lte: in15Days },
                },
                include: {
                    customer: { select: { fullName: true, phone: true } },
                    contractType: { select: { name: true, code: true } },
                },
                orderBy: { endDate: 'asc' },
            }),
            prisma_1.default.contract.findMany({
                where: {
                    ...baseWhere,
                    endDate: { gte: now, lte: in30Days },
                },
                include: {
                    customer: { select: { fullName: true, phone: true } },
                    contractType: { select: { name: true, code: true } },
                },
                orderBy: { endDate: 'asc' },
            }),
        ]);
        return {
            count7: expiring7Days.length,
            count15: expiring15Days.length,
            count30: expiring30Days.length,
            list7: expiring7Days,
            list15: expiring15Days,
            list30: expiring30Days,
        };
    }
}
exports.ContractService = ContractService;
