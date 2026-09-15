"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const response_utils_1 = require("../utils/response.utils");
const validateRequest = (schema) => {
    return async (req, res, next) => {
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
            req.query = sanitizedQuery;
            req.params = sanitizedParams;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return (0, response_utils_1.sendError)(res, 'خطأ في التحقق من البيانات المدخلة', 422, formattedErrors);
            }
            return (0, response_utils_1.sendError)(res, 'بيانات غير صالحة', 400);
        }
    };
};
exports.validateRequest = validateRequest;
