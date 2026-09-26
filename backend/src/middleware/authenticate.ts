import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { redisService } from '../config/redis.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required.',
      },
    });
    return;
  }

  try {
    // Check if token is blacklisted in Redis
    const isBlacklisted = await redisService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Session has been revoked. Please log in again.',
        },
      });
      return;
    }

    const payload = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as any;
    req.user = {
      id: String(payload.id || payload.sub),
      email: payload.email,
      role: payload.role || (payload.roles?.[0] ?? 'PATIENT'),
      roles: payload.roles || [payload.role || 'PATIENT'],
      permissions: payload.permissions || [],
      name: payload.name,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired access token.',
      },
    });
  }
}
