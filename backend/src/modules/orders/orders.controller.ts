import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';
// Order Lifecycle State Machine: Valid Next States Map
export const OrderStatus = {
  ORDERED: 'ORDERED',
  SCHEDULED: 'SCHEDULED',
  COLLECTED: 'COLLECTED',
  RECEIVED: 'RECEIVED',
  PROCESSING: 'PROCESSING',
  RESULT_ENTERED: 'RESULT_ENTERED',
  VALIDATED: 'VALIDATED',
  VERIFIED: 'VERIFIED',
  RELEASED: 'RELEASED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

const ALLOWED_ORDER_TRANSITIONS: Record<string, string[]> = {
  [OrderStatus.ORDERED]: [OrderStatus.SCHEDULED, OrderStatus.COLLECTED, OrderStatus.RECEIVED, OrderStatus.CANCELLED],
  [OrderStatus.SCHEDULED]: [OrderStatus.COLLECTED, OrderStatus.CANCELLED],
  [OrderStatus.COLLECTED]: [OrderStatus.RECEIVED, OrderStatus.CANCELLED],
  [OrderStatus.RECEIVED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.RESULT_ENTERED, OrderStatus.CANCELLED],
  [OrderStatus.RESULT_ENTERED]: [OrderStatus.VALIDATED, OrderStatus.CANCELLED],
  [OrderStatus.VALIDATED]: [OrderStatus.VERIFIED, OrderStatus.CANCELLED],
  [OrderStatus.VERIFIED]: [OrderStatus.RELEASED],
  [OrderStatus.RELEASED]: [], // Terminal state
  [OrderStatus.CANCELLED]: [],
};

const updateStatusSchema = z.object({
  status: z.enum([
    'ORDERED',
    'SCHEDULED',
    'COLLECTED',
    'RECEIVED',
    'PROCESSING',
    'RESULT_ENTERED',
    'VALIDATED',
    'VERIFIED',
    'RELEASED',
    'CANCELLED',
  ]),
  reason: z.string().optional(),
});

export const ordersController = {
  list: async (req: Request, res: Response): Promise<void> => {
    let whereClause: any = {};

    if (req.user?.roles?.includes('PATIENT') && !req.user?.roles?.includes('DOCTOR') && !req.user?.roles?.includes('LAB_ADMIN')) {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
      // A patient account with no linked patient record sees nothing (previously it saw every order).
      whereClause.patientId = patient ? patient.id : '__none__';
    }

    const orders = await prisma.labOrder.findMany({
      where: whereClause,
      include: {
        patient: true,
        prescription: { include: { items: true } },
        items: { include: { testCatalog: true } },
        reports: true,
        samples: true,
        statusHistory: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = orders.map((o) => {
      const tests = o.prescription?.items.map((i) => i.testName) ||
        o.items.map((i) => i.testCatalog.name) || ['Diagnostic Panel'];

      const reportUrl = o.reports[0] ? `/api/v1/reports/${o.reports[0].reportNumber}/download` : null;

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        prescriptionId: o.prescriptionId,
        labId: 2,
        patientId: o.patientId,
        patientName: `${o.patient.firstName} ${o.patient.lastName}`,
        age: new Date().getFullYear() - o.patient.dateOfBirth.getFullYear(),
        gender: o.patient.gender,
        tests,
        status: o.status === 'RELEASED' ? 'UPLOADED' : o.status,
        internalStatus: o.status,
        priority: o.priority,
        totalAmount: Number(o.totalAmount),
        isPaid: o.isPaid,
        reportUrl,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      };
    });

    res.json(formatted);
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);

    const order = await prisma.labOrder.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        patient: true,
        prescription: { include: { items: true } },
        items: { include: { testCatalog: true } },
        results: { include: { parameters: true } },
        reports: true,
        samples: { include: { events: true } },
        statusHistory: { orderBy: { timestamp: 'asc' } },
      },
    });

    const isPatientOnly =
      req.user?.roles?.includes('PATIENT') &&
      !req.user?.roles?.some((r) => ['DOCTOR', 'LAB_ADMIN', 'LAB_SUPERVISOR', 'LAB_TECHNICIAN', 'RECEPTIONIST', 'SUPER_ADMIN'].includes(r));

    // Interim ownership check (full scoping in T-017): patients only see their own orders.
    if (!order || (isPatientOnly && order.patient?.userId !== req.user?.id)) {
      res.status(404).json({ success: false, error: { message: 'Lab order not found' } });
      return;
    }

    res.json({ success: true, data: order });
  },

  updateStatus: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { status: targetStatus, reason } = updateStatusSchema.parse(req.body);

    const order = await prisma.labOrder.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ success: false, error: { message: 'Order not found' } });
      return;
    }

    // Authorization and release must go through the pathologist workflow (T-039/T-040),
    // never through this generic endpoint (M0 safety fix).
    if (targetStatus === OrderStatus.VERIFIED || targetStatus === OrderStatus.RELEASED) {
      res.status(403).json({
        success: false,
        error: {
          code: 'RELEASE_DISABLED',
          message: 'Report authorization and release are disabled until the pathologist workflow is available.',
        },
      });
      return;
    }

    const allowedNext = ALLOWED_ORDER_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(targetStatus)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: `Cannot transition order status from '${order.status}' to '${targetStatus}'.`,
          allowedNextStates: allowedNext,
        },
      });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.labOrder.update({
        where: { id },
        data: {
          status: targetStatus,
          updatedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: targetStatus,
          changedById: req.user?.id || 'SYSTEM',
          reason,
        },
      });

      return o;
    });

    res.json({ success: true, data: updated });
  },
};
