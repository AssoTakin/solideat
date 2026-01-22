import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Middleware de validation avec Zod
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error.errors) {
        res.status(400).json({
          error: 'Erreur de validation',
          details: error.errors,
        });
      } else {
        res.status(400).json({
          error: 'Erreur de validation',
          message: error.message,
        });
      }
    }
  };
};
