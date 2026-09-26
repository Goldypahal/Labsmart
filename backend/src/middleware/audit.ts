import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export function auditAction(actionName: string, entityType: string, extractEntityId?: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Let the route handler finish first
    res.on('finish', async () => {
      // Only audit successful operations or explicit clinical actions
      if (res.statusCode < 400) {
        try {
          const entityId = extractEntityId ? extractEntityId(req) : (req.params.id || 'N/A');
          await prisma.auditLog.create({
            data: {
              actorId: req.user?.id || null,
              action: actionName,
              entityType,
              entityId: String(entityId),
              ipAddress: req.ip || (req.socket.remoteAddress ?? 'unknown'),
              userAgent: req.headers['user-agent'] || null,
              metadata: JSON.stringify({
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
              }),
            },
          });
        } catch {
          // Asynchronous audit logging failure should never crash the user process
        }
      }
    });

    next();
  };
}
