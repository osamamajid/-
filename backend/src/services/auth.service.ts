import prisma from '../config/prisma';
import { comparePassword, hashPassword } from '../utils/password.utils';
import { signToken } from '../utils/jwt.utils';
import { AuditService } from './audit.service';
import { Request } from 'express';

export class AuthService {
  static async login(username: string, password: string, req?: Request) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    if (!user.isActive) {
      throw new Error('هذا الحساب معطل، يرجى التواصل مع إدارة النظام');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.code);

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role.name,
      roleName: user.role.displayName,
      mustChangePassword: user.mustChangePassword,
    });

    // تسجيل الدخول في سجل العمليات
    await AuditService.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      details: { message: 'تسجيل دخول ناجح للمستخدم' },
      req,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role.name,
        roleName: user.role.displayName,
        mustChangePassword: user.mustChangePassword,
        permissions,
      },
    };
  }

  static async changePassword(userId: string, currentPass: string, newPass: string, req?: Request) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    const isValid = await comparePassword(currentPass, user.passwordHash);
    if (!isValid) {
      throw new Error('كلمة المرور الحالية غير صحيحة');
    }

    const newHash = await hashPassword(newPass);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false, // رفع إجبار التغيير
      },
    });

    await AuditService.log({
      userId,
      action: 'PASSWORD_CHANGE',
      entity: 'User',
      entityId: userId,
      details: { message: 'تم تغيير كلمة المرور بنجاح' },
      req,
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    const permissions = user.role.permissions.map((rp) => rp.permission.code);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role.name,
      roleName: user.role.displayName,
      mustChangePassword: user.mustChangePassword,
      permissions,
    };
  }
}
