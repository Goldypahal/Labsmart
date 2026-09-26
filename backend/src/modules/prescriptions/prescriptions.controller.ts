import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma.js';

const createPrescriptionSchema = z.object({
  patientId: z.union([z.string(), z.number()]),
  tests: z.array(z.string().min(1)).min(1).max(30),
  priority: z.enum(['ROUTINE', 'URGENT', 'STAT']).optional().default('ROUTINE'),
  notes: z.string().optional(),
});

export const prescriptionsController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const { patientId, tests, priority, notes } = createPrescriptionSchema.parse(req.body);

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { id: String(patientId) },
          { mrn: String(patientId) },
          { userId: String(patientId) },
          ...(Number.isSafeInteger(Number(patientId)) ? [{ mrn: `MRN-2026-00${patientId}` }] : []),
        ],
      },
    });

    if (!patient) {
      res.status(400).json({
        success: false,
        error: { code: 'PATIENT_NOT_FOUND', message: 'A valid patient profile was not found.' },
      });
      return;
    }

    const doctor = await prisma.doctor.findFirst({
      where: { userId: req.user?.id },
    }) || await prisma.doctor.findFirst();

    if (!doctor) {
      res.status(403).json({
        success: false,
        error: { code: 'DOCTOR_PROFILE_REQUIRED', message: 'You must have a doctor profile to prescribe tests.' },
      });
      return;
    }

    const facility = await prisma.facility.findFirst() || await prisma.facility.create({
      data: {
        name: 'Pahal Central Hospital & Diagnostic Institute',
        code: 'PCH-BLR-01',
        type: 'HOSPITAL',
        address: '100 Feet Ring Road, Indiranagar',
        city: 'Bengaluru',
        phone: '+91 80 2500 0000',
      },
    });

    const orderNumber = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const newPrescription = await tx.prescription.create({
        data: {
          doctorId: doctor.id,
          patientId: patient.id,
          notes,
          status: 'PENDING',
          items: {
            create: tests.map((t) => ({ testName: t })),
          },
        },
        include: { items: true },
      });

      const newOrder = await tx.labOrder.create({
        data: {
          orderNumber,
          patientId: patient.id,
          prescriptionId: newPrescription.id,
          facilityId: facility.id,
          status: 'RECEIVED',
          priority,
          totalAmount: tests.length * 350,
          statusHistory: {
            create: {
              status: 'RECEIVED',
              changedById: req.user?.id || 'SYSTEM',
              reason: 'Requisition submitted by clinician',
            },
          },
        },
      });

      return { prescription: newPrescription, order: newOrder };
    });

    res.status(201).json({
      success: true,
      id: result.prescription.id,
      doctorId: result.prescription.doctorId,
      patientId: result.prescription.patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      tests,
      status: result.prescription.status,
      orderNumber: result.order.orderNumber,
      createdAt: result.prescription.createdAt.toISOString(),
      updatedAt: result.prescription.updatedAt.toISOString(),
      data: result,
    });
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const prescriptions = await prisma.prescription.findMany({
      include: {
        items: true,
        patient: true,
        doctor: { include: { user: true } },
        labOrders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = prescriptions.map((p) => ({
      id: p.id,
      doctorId: p.doctorId,
      patientId: p.patientId,
      patientName: `${p.patient.firstName} ${p.patient.lastName}`,
      doctorName: `Dr. ${p.doctor.specialization.split(' ')[0]}`,
      tests: p.items.map((i) => i.testName),
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json(formatted);
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { tests } = req.body;

    if (!Array.isArray(tests) || tests.length === 0) {
      res.status(400).json({ success: false, error: { message: 'tests array is required' } });
      return;
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!prescription) {
      res.status(404).json({ success: false, error: { message: 'Prescription not found' } });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.prescriptionItem.deleteMany({ where: { prescriptionId: id } });
      await tx.prescriptionItem.createMany({
        data: tests.map((t: string) => ({ prescriptionId: id, testName: t })),
      });
      await tx.prescription.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    });

    res.json({
      success: true,
      id,
      tests,
      updatedAt: new Date().toISOString(),
    });
  },
};
