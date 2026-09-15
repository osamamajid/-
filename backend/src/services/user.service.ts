import prisma from '../config/prisma';
import { hashPassword } from '../utils/password.utils';
import { AuditService } from './audit.service';
import { Request } from 'express';

export class UserService {
  static async getUsers() {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        isActive: true,
        mustChangePassword: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
        _count: {
          select: { createdContracts: true },
        },
        createdAt: true,
      },
    });

    return users.map((u) => ({
      ...u,
      role: u.role?.name ?? '',
      roleName: u.role?.displayName ?? '',
      contractsCount: u._count.createdContracts,
    }));
  }

  static async getRoles() {
    return prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  static async createUser(data: any, req?: Request) {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existing) {
      throw new Error('اسم المستخدم أو البريد الإلكتروني مسجل بالفعل');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone || null,
        roleId: data.roleId,
        isActive: true,
        mustChangePassword: data.mustChangePassword ?? false,
      },
      include: {
        role: true,
      },
    });

    await AuditService.log({
      userId: req?.user?.userId,
      action: 'USER_CREATE',
      entity: 'User',
      entityId: user.id,
      details: { username: user.username, role: user.role.name },
      req,
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
    };
  }

  static async updateUser(id: string, data: any, req?: Request) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('المستخدم غير موجود');
    }

    const updateData: any = {
      fullName: data.fullName ?? existing.fullName,
      email: data.email ?? existing.email,
      phone: data.phone !== undefined ? data.phone : existing.phone,
      roleId: data.roleId ?? existing.roleId,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
    };

    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    await AuditService.log({
      userId: req?.user?.userId,
      action: 'USER_UPDATE',
      entity: 'User',
      entityId: id,
      details: { username: updated.username },
      req,
    });

    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      fullName: updated.fullName,
      phone: updated.phone,
      role: updated.role,
      isActive: updated.isActive,
      mustChangePassword: updated.mustChangePassword,
    };
  }

  static async toggleStatus(id: string, req?: Request) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('المستخدم غير موجود');

    // لا يمكن تعطيل المستخدم الحالي لنفسه
    if (req?.user?.userId === id) {
      throw new Error('لا يمكنك تعطيل حسابك الشخصي النشط');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    await AuditService.log({
      userId: req?.user?.userId,
      action: updated.isActive ? 'USER_ACTIVATE' : 'USER_DEACTIVATE',
      entity: 'User',
      entityId: id,
      details: { username: user.username, newStatus: updated.isActive },
      req,
    });

    return updated;
  }

  static async deleteUser(id: string, req?: Request) {
    if (req?.user?.userId === id) {
      throw new Error('لا يمكنك حذف حسابك الشخصي');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { createdContracts: true } },
      },
    });

    if (!user) throw new Error('المستخدم غير موجود');

    if (user._count.createdContracts > 0) {
      throw new Error('لا يمكن حذف المستخدم لأنه قام بإنشاء عقود مسجلة، يمكنك تعطيل حسابه بدلاً من ذلك');
    }

    await prisma.user.delete({ where: { id } });

    await AuditService.log({
      userId: req?.user?.userId,
      action: 'USER_DELETE',
      entity: 'User',
      entityId: id,
      details: { username: user.username },
      req,
    });

    return { message: 'تم حذف المستخدم بنجاح' };
  }
}
