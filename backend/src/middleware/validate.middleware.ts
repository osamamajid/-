import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.utils';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sanitizedBody = req.body && typeof req.body === 'object' ? JSON.parse(JSON.stringify(req.body)) : req.body;
      const sanitizedQuery = req.query && typeof req.query === 'object' ? JSON.parse(JSON.stringify(req.query)) : req.query;
      const sanitizedParams = req.params && typeof req.params === 'object' ? JSON.parse(JSON.stringify(req.params)) : req.params;

      await schema.parseAsync({
        body: sanitizedBody,
        query: sanitizedQuery,
        params: sanitizedParams,
      });

      req.body = sanitizedBody;
      req.query = sanitizedQuery as any;
      req.params = sanitizedParams as any;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return sendError(res, 'خطأ في التحقق من البيانات المدخلة', 422, formattedErrors);
      }
      return sendError(res, 'بيانات غير صالحة', 400);
    }
  };
};
