import { Request, Response, NextFunction } from 'express';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
      return;
    }

    const userRoles = req.user.roles || [req.user.role];
    const hasRole = allowedRoles.some((r) => userRoles.includes(r));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: 'Access denied: insufficient role privileges.',
          requiredRoles: allowedRoles,
        },
      });
      return;
    }

    next();
  };
}

export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
      return;
    }

    // SUPER_ADMIN bypasses granular permission check
    if (req.user.roles?.includes('SUPER_ADMIN')) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasAllPermissions) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_PERMISSION',
          message: 'Access denied: missing requisite clinical permission.',
          requiredPermissions,
        },
      });
      return;
    }

    next();
  };
}
