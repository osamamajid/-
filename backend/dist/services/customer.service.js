"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const contractNumber_utils_1 = require("../utils/contractNumber.utils");
const audit_service_1 = require("./audit.service");
class CustomerService {
    static async getCustomers(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            const s = query.search.trim();
            where.OR = [
                { customerNumber: { contains: s } },
                { fullName: { contains: s } },
                { phone: { contains: s } },
                { nationalId: { contains: s } },
            ];
        }
        if (query.governorate) {
            where.governorate = query.governorate;
        }
        const [customers, total] = await Promise.all([
            prisma_1.default.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { contracts: true },
                    },
                },
            }),
            prisma_1.default.customer.count({ where }),
        ]);
        return {
            customers: customers.map((c) => ({
                ...c,
                contractsCount: c._count.contracts,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async getCustomerById(id) {
        const customer = await prisma_1.default.customer.findUnique({
            where: { id },
            include: {
                contracts: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        contractType: { select: { name: true, code: true, icon: true } },
                        createdBy: { select: { fullName: true } },
                    },
                },
            },
        });
        if (!customer) {
            throw new Error('العميل غير موجود');
        }
        return customer;
    }
    static async createCustomer(data, req) {
        const customerNumber = await (0, contractNumber_utils_1.generateNextCustomerNumber)();
        const customer = await prisma_1.default.customer.create({
            data: {
                customerNumber,
                fullName: data.fullName,
                phone: data.phone,
                nationalId: data.nationalId || null,
                address: data.address || null,
                governorate: data.governorate || null,
                notes: data.notes || null,
            },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CUSTOMER_CREATE',
            entity: 'Customer',
            entityId: customer.id,
            details: { customerNumber: customer.customerNumber, fullName: customer.fullName },
            req,
        });
        return customer;
    }
    static async updateCustomer(id, data, req) {
        const existing = await prisma_1.default.customer.findUnique({ where: { id } });
        if (!existing) {
            throw new Error('العميل غير موجود');
        }
        const updated = await prisma_1.default.customer.update({
            where: { id },
            data: {
                fullName: data.fullName ?? existing.fullName,
                phone: data.phone ?? existing.phone,
                nationalId: data.nationalId !== undefined ? data.nationalId : existing.nationalId,
                address: data.address !== undefined ? data.address : existing.address,
                governorate: data.governorate !== undefined ? data.governorate : existing.governorate,
                notes: data.notes !== undefined ? data.notes : existing.notes,
            },
        });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CUSTOMER_UPDATE',
            entity: 'Customer',
            entityId: updated.id,
            details: { previous: existing, updated },
            req,
        });
        return updated;
    }
    static async deleteCustomer(id, req) {
        const customer = await prisma_1.default.customer.findUnique({
            where: { id },
            include: {
                contracts: {
                    where: {
                        deletedAt: null,
                        status: { in: ['ACTIVE', 'DRAFT'] },
                    },
                },
            },
        });
        if (!customer) {
            throw new Error('العميل غير موجود');
        }
        if (customer.contracts.length > 0) {
            throw new Error('لا يمكن حذف العميل لوجود عقود نشطة أو مسودات مرتبطة به');
        }
        await prisma_1.default.customer.delete({ where: { id } });
        await audit_service_1.AuditService.log({
            userId: req?.user?.userId,
            action: 'CUSTOMER_DELETE',
            entity: 'Customer',
            entityId: id,
            details: { customerNumber: customer.customerNumber, fullName: customer.fullName },
            req,
        });
        return { message: 'تم حذف العميل بنجاح' };
    }
}
exports.CustomerService = CustomerService;
