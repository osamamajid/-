"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class ReportService {
    static async getContractsReport(filters) {
        const where = {
            deletedAt: null,
        };
        if (filters.typeId)
            where.contractTypeId = filters.typeId;
        if (filters.status)
            where.status = filters.status;
        if (filters.paymentMethod)
            where.paymentMethod = filters.paymentMethod;
        if (filters.startDate || filters.endDate) {
            where.issueDate = {};
            if (filters.startDate)
                where.issueDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.issueDate.lte = new Date(filters.endDate);
        }
        const contracts = await prisma_1.default.contract.findMany({
            where,
            orderBy: { issueDate: 'desc' },
            include: {
                customer: { select: { fullName: true, phone: true, nationalId: true, governorate: true } },
                contractType: { select: { name: true, code: true } },
                createdBy: { select: { fullName: true } },
            },
        });
        const totalAmount = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
        return {
            count: contracts.length,
            totalAmount,
            contracts,
        };
    }
    static async getRevenuesReport(filters) {
        const where = {
            deletedAt: null,
            status: { in: ['ACTIVE', 'EXPIRED'] },
        };
        if (filters.startDate || filters.endDate) {
            where.startDate = {};
            if (filters.startDate)
                where.startDate.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.startDate.lte = new Date(filters.endDate);
        }
        const contracts = await prisma_1.default.contract.findMany({
            where,
            select: {
                id: true,
                contractNumber: true,
                totalAmount: true,
                paymentMethod: true,
                startDate: true,
                customer: { select: { fullName: true } },
                contractType: { select: { name: true } },
            },
        });
        const totalRevenue = contracts.reduce((sum, c) => sum + c.totalAmount, 0);
        // تجميع الإيرادات حسب طريقة الدفع
        const byPaymentMethod = {};
        contracts.forEach((c) => {
            const method = c.paymentMethod || 'OTHER';
            byPaymentMethod[method] = (byPaymentMethod[method] || 0) + c.totalAmount;
        });
        return {
            totalRevenue,
            contractsCount: contracts.length,
            byPaymentMethod,
            contracts,
        };
    }
    static async getCustomersReport() {
        const customers = await prisma_1.default.customer.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                contracts: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                    },
                },
            },
        });
        const formatted = customers.map((c) => {
            const totalContracts = c.contracts.length;
            const activeContracts = c.contracts.filter((con) => con.status === 'ACTIVE').length;
            const totalSpend = c.contracts.reduce((sum, con) => sum + con.totalAmount, 0);
            return {
                id: c.id,
                customerNumber: c.customerNumber,
                fullName: c.fullName,
                phone: c.phone,
                nationalId: c.nationalId,
                governorate: c.governorate,
                totalContracts,
                activeContracts,
                totalSpend,
                createdAt: c.createdAt,
            };
        });
        return {
            count: customers.length,
            customers: formatted,
        };
    }
}
exports.ReportService = ReportService;
