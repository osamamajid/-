"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class DashboardService {
    static async getStats() {
        const now = new Date();
        // بداية اليوم
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // بداية الشهر الحالي
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // حدود انتهاء العقود
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const baseContractWhere = {
            deletedAt: null,
            isArchived: false,
        };
        const [totalContracts, todayContracts, monthContracts, activeContracts, expiredContracts, draftContracts, totalCustomers, expiring7DaysCount, expiring15DaysCount, expiring30DaysCount, contractsByType, recentContracts,] = await Promise.all([
            prisma_1.default.contract.count({ where: baseContractWhere }),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    createdAt: { gte: startOfToday },
                },
            }),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    createdAt: { gte: startOfMonth },
                },
            }),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    status: 'ACTIVE',
                },
            }),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    status: 'EXPIRED',
                },
            }),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    status: 'DRAFT',
                },
            }),
            prisma_1.default.customer.count(),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    status: 'ACTIVE',
                    endDate: { gte: now, lte: in7Days },
                },
            }),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    status: 'ACTIVE',
                    endDate: { gte: now, lte: in15Days },
                },
            }),
            prisma_1.default.contract.count({
                where: {
                    ...baseContractWhere,
                    status: 'ACTIVE',
                    endDate: { gte: now, lte: in30Days },
                },
            }),
            prisma_1.default.contractType.findMany({
                select: {
                    id: true,
                    name: true,
                    code: true,
                    icon: true,
                    _count: {
                        select: {
                            contracts: {
                                where: baseContractWhere,
                            },
                        },
                    },
                },
            }),
            prisma_1.default.contract.findMany({
                where: baseContractWhere,
                take: 7,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { fullName: true, phone: true } },
                    contractType: { select: { name: true, code: true, icon: true } },
                    createdBy: { select: { fullName: true } },
                },
            }),
        ]);
        // حساب إجمالي قيمة العقود النشطة
        const sumResult = await prisma_1.default.contract.aggregate({
            where: {
                ...baseContractWhere,
                status: 'ACTIVE',
            },
            _sum: {
                totalAmount: true,
            },
        });
        return {
            kpis: {
                totalContracts,
                todayContracts,
                monthContracts,
                activeContracts,
                expiredContracts,
                draftContracts,
                totalCustomers,
                activeTotalRevenue: sumResult._sum.totalAmount || 0,
                expiringSoon: {
                    within7Days: expiring7DaysCount,
                    within15Days: expiring15DaysCount,
                    within30Days: expiring30DaysCount,
                },
            },
            contractsByType: contractsByType.map((t) => ({
                id: t.id,
                name: t.name,
                code: t.code,
                icon: t.icon,
                count: t._count.contracts,
            })),
            recentContracts,
        };
    }
    static async getMonthlyTrends() {
        // جمع بيانات العقود لآخر 6 أشهر
        const contracts = await prisma_1.default.contract.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                createdAt: true,
                totalAmount: true,
                status: true,
            },
        });
        const arabicMonths = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        const monthlyMap = {};
        // تهيئة الأشهر الستة الماضية
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = {
                month: `${arabicMonths[d.getMonth()]} ${d.getFullYear()}`,
                count: 0,
                revenue: 0,
            };
        }
        contracts.forEach((c) => {
            const d = new Date(c.createdAt);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyMap[key]) {
                monthlyMap[key].count += 1;
                monthlyMap[key].revenue += c.totalAmount;
            }
        });
        return Object.values(monthlyMap);
    }
}
exports.DashboardService = DashboardService;
