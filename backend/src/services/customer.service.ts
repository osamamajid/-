import prisma from '../config/prisma';
import { generateNextCustomerNumber } from '../utils/contractNumber.utils';
import { AuditService } from './audit.service';
import { Request } from 'express';

export class CustomerService {
  static async getCustomers(query: {
    search?: string;
    governorate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

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
      prisma.customer.findMany({
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
      prisma.customer.count({ where }),
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

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
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

  static async createCustomer(data: any, req?: Request) {
    const customerNumber = await generateNextCustomerNumber();

    const customer = await prisma.customer.create({
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

    await AuditService.log({
      userId: req?.user?.userId,
      action: 'CUSTOMER_CREATE',
      entity: 'Customer',
      entityId: customer.id,
      details: { customerNumber: customer.customerNumber, fullName: customer.fullName },
      req,
    });

    return customer;
  }

  static async updateCustomer(id: string, data: any, req?: Request) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('العميل غير موجود');
    }

    const updated = await prisma.customer.update({
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

    await AuditService.log({
      userId: req?.user?.userId,
      action: 'CUSTOMER_UPDATE',
      entity: 'Customer',
      entityId: updated.id,
      details: { previous: existing, updated },
      req,
    });

    return updated;
  }

  static async deleteCustomer(id: string, req?: Request) {
    const customer = await prisma.customer.findUnique({
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

    await prisma.customer.delete({ where: { id } });

    await AuditService.log({
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
