import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logSecurityEvent } from '../utils/securityLogger';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        logSecurityEvent({
          event: 'VALIDATION_FAILED',
          ip: req.ip,
          path: req.originalUrl,
          method: req.method,
          details: errorMessages,
        });

        return res.status(400).json({
          success: false,
          error: {
            message: `Validation error: ${errorMessages}`,
            code: 'VALIDATION_ERROR',
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          message: 'Malformed request body',
          code: 'BAD_REQUEST',
        },
      });
    }
  };
};
