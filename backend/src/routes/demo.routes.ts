import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import { signToken } from '../utils/jwt.utils';
import { sendSuccess, sendError } from '../utils/response.utils';

const router = Router();

// Demo 1-click login endpoint - strictly disabled in production
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'demo' && process.env.NODE_ENV !== 'development') {
    return sendError(res, 'تسجيل الدخول التجريبي السريع متاح فقط في بيئة العرض التجريبي', 403);
  }

  try {
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' },
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

    if (!demoUser || !demoUser.isActive) {
      return sendError(res, 'حساب المستخدم التجريبي غير متاح حالياً، يرجى تهيئة النظام', 404);
    }

    const permissions = demoUser.role.permissions.map((rp) => rp.permission.code);
    const token = signToken({
      userId: demoUser.id,
      username: demoUser.username,
      role: demoUser.role.name,
      roleName: demoUser.role.displayName,
      mustChangePassword: false,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        fullName: demoUser.fullName,
        phone: demoUser.phone,
        role: demoUser.role.name,
        roleName: demoUser.role.displayName,
        mustChangePassword: false,
        permissions,
      },
    }, 'تم تسجيل الدخول بالحساب التجريبي بنجاح');
  } catch (error: any) {
    return sendError(res, error.message || 'فشل تسجيل الدخول التجريبي', 500);
  }
});

// Demo reset endpoint - only available in demo environment
router.post('/reset', authenticate, async (req: Request, res: Response) => {
  // Only allow in demo environment
  if (process.env.NODE_ENV !== 'demo' && process.env.NODE_ENV !== 'development') {
    return sendError(res, 'Demo reset only available in demo environment', 403);
  }

  // Only allow demo user to trigger reset
  if (req.user?.role !== 'DEMO') {
    return sendError(res, 'Only demo user can reset demo data', 403);
  }

  try {
    // Delete demo-created data (contracts, customers created by demo user)
    // Keep system data (roles, permissions, contract types, templates, settings)
    
    // Get demo user
    const demoUser = await prisma.user.findUnique({
      where: { username: 'demo' }
    });

    if (!demoUser) {
      return sendError(res, 'Demo user not found', 404);
    }

    // Delete contracts created by demo user
    await prisma.contractValue.deleteMany({
      where: {
        contract: {
          createdById: demoUser.id
        }
      }
    });

    await prisma.contract.deleteMany({
      where: { createdById: demoUser.id }
    });

    // Delete customers created by demo user (keep seeded ones)
    const seededCustomerNumbers = ['CUST-0001', 'CUST-0002', 'CUST-0003', 'CUST-0004', 'CUST-0005'];
    
    await prisma.customer.deleteMany({
      where: {
        customerNumber: {
          notIn: seededCustomerNumbers
        }
      }
    });

    // Re-seed demo contracts for demo user
    const now = new Date();
    const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const in12Days = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);

    // Get contract types and customers
    const contractTypes = await prisma.contractType.findMany();
    const customers = await prisma.customer.findMany();

    if (contractTypes.length > 0 && customers.length > 0) {
      const demoContracts = [
        {
          contractNumber: `CTR-${now.getFullYear()}-${String(Date.now()).slice(-6)}`,
          contractTypeId: contractTypes.find(t => t.code === 'RENTAL')?.id || contractTypes[0].id,
          customerId: customers[0].id,
          createdById: demoUser.id,
          issueDate: new Date(),
          startDate: new Date(),
          endDate: in5Days,
          status: 'ACTIVE',
          totalAmount: 60000,
          paymentMethod: 'BANK_TRANSFER',
          notes: 'عقد إيجار مكتب تجاري - ينتهي خلال أيام للتجديد',
          isArchived: false
        },
        {
          contractNumber: `CTR-${now.getFullYear()}-${String(Date.now() + 1).slice(-6)}`,
          contractTypeId: contractTypes.find(t => t.code === 'TRAFFIC')?.id || contractTypes[0].id,
          customerId: customers[2]?.id || customers[0].id,
          createdById: demoUser.id,
          issueDate: new Date(),
          startDate: new Date(),
          endDate: in12Days,
          status: 'ACTIVE',
          totalAmount: 115000,
          paymentMethod: 'CASH',
          notes: 'مبايعة سيارة لاندكروزر مع التنازل واستكمال النقل',
          isArchived: false
        }
      ];

      for (const c of demoContracts) {
        await prisma.contract.create({ data: c });
      }
    }

    return sendSuccess(res, { message: 'Demo data reset successfully' }, 'تم إعادة تعيين البيانات التجريبية بنجاح');
  } catch (error: any) {
    console.error('Demo reset error:', error);
    return sendError(res, error.message || 'فشل إعادة تعيين البيانات التجريبية', 500);
  }
});

// Demo status endpoint
router.get('/status', async (req: Request, res: Response) => {
  const demoUser = await prisma.user.findUnique({ where: { username: 'demo' } });
  return sendSuccess(res, {
    isDemoMode: process.env.NODE_ENV === 'demo' || process.env.NODE_ENV === 'development',
    environment: process.env.NODE_ENV || 'development',
    demoUserExists: !!demoUser,
  }, 'حالة الوضع التجريبي');
});

export default router;