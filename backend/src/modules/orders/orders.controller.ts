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
      if (patient) {
        whereClause.patientId = patient.id;
      }
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

    if (!order) {
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

  uploadReport: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { reportUrl } = req.body;

    const order = await prisma.labOrder.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: { prescription: true },
    });

    if (!order) {
      res.status(404).json({ success: false, error: { message: 'Order not found' } });
      return;
    }

    const reportNumber = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const o = await tx.labOrder.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.RELEASED,
          updatedAt: new Date(),
        },
      });

      await tx.reportDocument.create({
        data: {
          reportNumber,
          orderId: order.id,
          storageKey: reportUrl || `s3://reports/${reportNumber}.pdf`,
          checksumSha256: 'SHA256-SIMULATED-CHECKSUM',
          fileSizeBytes: 1048576,
          releasedById: req.user?.id || 'SYSTEM',
        },
      });

      if (order.prescriptionId) {
        await tx.prescription.update({
          where: { id: order.prescriptionId },
          data: { status: 'COMPLETED', updatedAt: new Date() },
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.RELEASED,
          changedById: req.user?.id || 'SYSTEM',
          reason: 'Official diagnostic report uploaded and released to clinician and patient.',
        },
      });

      return o;
    });

    res.json({
      success: true,
      id: updatedOrder.id,
      status: 'UPLOADED',
      reportUrl,
      updatedAt: updatedOrder.updatedAt.toISOString(),
    });
  },
};
