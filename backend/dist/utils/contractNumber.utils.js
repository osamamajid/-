"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNextCustomerNumber = exports.generateNextContractNumber = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const generateNextContractNumber = async () => {
    const currentYear = new Date().getFullYear();
    const prefix = `CTR-${currentYear}-`;
    // ابحث عن آخر عقد تم إنشاؤه في السنة الحالية
    const latestContract = await prisma_1.default.contract.findFirst({
        where: {
            contractNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            contractNumber: true,
        },
    });
    let nextSequence = 1;
    if (latestContract && latestContract.contractNumber) {
        const parts = latestContract.contractNumber.split('-');
        if (parts.length === 3) {
            const parsedSeq = parseInt(parts[2], 10);
            if (!isNaN(parsedSeq)) {
                nextSequence = parsedSeq + 1;
            }
        }
    }
    // التنسيق مع 6 خانات رقمية: CTR-2026-000001
    const paddedSequence = String(nextSequence).padStart(6, '0');
    return `${prefix}${paddedSequence}`;
};
exports.generateNextContractNumber = generateNextContractNumber;
const generateNextCustomerNumber = async () => {
    const latestCustomer = await prisma_1.default.customer.findFirst({
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            customerNumber: true,
        },
    });
    let nextSequence = 1;
    if (latestCustomer && latestCustomer.customerNumber) {
        const parts = latestCustomer.customerNumber.split('-');
        if (parts.length === 2) {
            const parsedSeq = parseInt(parts[1], 10);
            if (!isNaN(parsedSeq)) {
                nextSequence = parsedSeq + 1;
            }
        }
    }
    return `CUST-${String(nextSequence).padStart(4, '0')}`;
};
exports.generateNextCustomerNumber = generateNextCustomerNumber;
