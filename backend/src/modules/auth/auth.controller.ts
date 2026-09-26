import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { redisService } from '../../config/redis.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        doctorProfile: true,
        patientProfile: true,
        staffProfile: true,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your healthcare account is suspended or pending.' },
      });
      return;
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const primaryRole = roles[0] || 'PATIENT';
    const permissions = Array.from(
      new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.slug)))
    );

    const displayName =
      user.doctorProfile ? `Dr. ${user.doctorProfile.specialization.split(' ')[0]}` :
      user.patientProfile ? `${user.patientProfile.firstName} ${user.patientProfile.lastName}` :
      user.staffProfile ? user.staffProfile.designation :
      user.email.split('@')[0];

    const tokenPayload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: primaryRole,
      roles,
      permissions,
      name: displayName,
    };

    const accessToken = jwt.sign(tokenPayload, ENV.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken.slice(-32),
        familyId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set secure HttpOnly cookie for web portals
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token: accessToken, // Backward-compatible top-level token
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: primaryRole,
          roles,
          permissions,
          name: displayName,
        },
      },
      // Backward-compatible user object
      user: {
        id: user.id,
        email: user.email,
        role: primaryRole,
        roles,
        name: displayName,
      },
    });
  },

  me: async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        patientProfile: true,
        doctorProfile: true,
        staffProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: req.user.role,
        roles: req.user.roles,
        permissions: req.user.permissions,
        patientProfile: user.patientProfile,
        doctorProfile: user.doctorProfile,
        staffProfile: user.staffProfile,
      },
    });
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Blacklist access token for remaining duration (up to 15m)
      await redisService.set(`blacklist:${token}`, '1', 900);
    }

    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully.' });
  },
};
