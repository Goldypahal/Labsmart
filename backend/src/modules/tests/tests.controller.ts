import { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';

export const testsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const catalog = await prisma.testCatalog.findMany({
      where: { isActive: true },
      include: {
        parameters: {
          include: { referenceRanges: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { code: 'asc' },
    });

    res.json({
      success: true,
      data: catalog,
    });
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);

    const test = await prisma.testCatalog.findFirst({
      where: { OR: [{ id }, { code: id }] },
      include: {
        parameters: {
          include: { referenceRanges: true },
        },
      },
    });

    if (!test) {
      res.status(404).json({ success: false, error: { message: 'Test not found' } });
      return;
    }

    res.json({ success: true, data: test });
  },
};
