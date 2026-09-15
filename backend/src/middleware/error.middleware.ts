import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';
import { ENV } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('💥 Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً';

  // في بيئة الإنتاج لا يتم إظهار تفاصيل أو Stack Trace الحساس
  const details = ENV.NODE_ENV === 'development' ? err.stack : undefined;

  return sendError(res, message, statusCode, details);
};
