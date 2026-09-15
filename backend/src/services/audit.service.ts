import { Request } from 'express';
import prisma from '../config/prisma';

interface LogActionParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: any;
  req?: Request;
}

export class AuditService {
  static async log({ userId, action, entity, entityId, details, req }: LogActionParams) {
    try {
      let ipAddress = '127.0.0.1';
      if (req) {
        ipAddress =
          (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
          req.socket?.remoteAddress ||
          '127.0.0.1';
      }

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          action,
          entity,
          entityId: entityId || null,
          details: details ? JSON.stringify(details) : null,
          ipAddress,
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  static async getLogs(query: { page?: number; limit?: number; action?: string; entity?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.action) {
      where.action = query.action;
    }
    if (query.entity) {
      where.entity = query.entity;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              role: { select: { displayName: true } },
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
