import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';

const DESTRUCTIVE_ACTIONS = [
  { method: 'DELETE', pathPattern: /^\/users\/.*/ },
  { method: 'DELETE', pathPattern: /^\/customers\/.*/ },
  { method: 'DELETE', pathPattern: /^\/contracts\/.*/ },
  { method: 'PATCH', pathPattern: /^\/contracts\/.*\/archive/ },
  { method: 'PATCH', pathPattern: /^\/contracts\/.*\/restore/ },
  { method: 'PATCH', pathPattern: /^\/contracts\/.*\/status/ },
  { method: 'POST', pathPattern: /^\/contract-types/ },
  { method: 'PUT', pathPattern: /^\/contract-types\/.*/ },
  { method: 'DELETE', pathPattern: /^\/contract-types\/.*/ },
  { method: 'POST', pathPattern: /^\/templates\/.*\/fields/ },
  { method: 'PUT', pathPattern: /^\/templates\/fields\/.*/ },
  { method: 'DELETE', pathPattern: /^\/templates\/fields\/.*/ },
  { method: 'PUT', pathPattern: /^\/settings/ },
  { method: 'PATCH', pathPattern: /^\/users\/.*\/toggle-status/ },
  { method: 'DELETE', pathPattern: /^\/users\/.*/ },
];

const DEMO_ADMIN_BLOCKED_ACTIONS = [
  { method: 'POST', pathPattern: /^\/users/ },
  { method: 'PUT', pathPattern: /^\/users\/.*/ },
  { method: 'PATCH', pathPattern: /^\/users\/.*\/toggle-status/ },
  { method: 'DELETE', pathPattern: /^\/users\/.*/ },
  { method: 'PUT', pathPattern: /^\/settings/ },
];

export const demoProtection = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next();
  }

  const isDemoUser = req.user.role === 'DEMO';

  if (!isDemoUser) {
    return next();
  }

  const method = req.method;
  const path = req.path;

  // Check if this is a destructive action
  const isDestructive = DESTRUCTIVE_ACTIONS.some(
    (action) => action.method === method && action.pathPattern.test(path)
  );

  if (isDestructive) {
    return sendError(
      res,
      'الحساب التجريبي لا يسمح بهذه العملية. يرجى التواصل مع فريق المبيعات للحصول على النسخة الكاملة.',
      403
    );
  }

  // Block admin-only actions for demo user
  const isAdminBlocked = DEMO_ADMIN_BLOCKED_ACTIONS.some(
    (action) => action.method === method && action.pathPattern.test(path)
  );

  if (isAdminBlocked) {
    return sendError(
      res,
      'الحساب التجريبي لا يملك صلاحيات الإدارة. هذه الميزة متاحة في النسخة الكاملة فقط.',
      403
    );
  }

  next();
};

export const isDemoUser = (req: Request): boolean => {
  return req.user?.role === 'DEMO';
};