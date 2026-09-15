import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { sendError } from '../utils/response.utils';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'يرجى تسجيل الدخول للوصول إلى هذا المورد', 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token || token.length < 20) {
      return sendError(res, 'رمز المصادقة غير صالح', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded?.userId || typeof decoded.userId !== 'string') {
      return sendError(res, 'رمز المصادقة غير صالح', 401);
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'انتهت صلاحية الجلسة أو الرمز غير صالح', 401);
  }
};
