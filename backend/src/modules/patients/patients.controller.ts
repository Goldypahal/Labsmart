import { Request, Response } from 'express';
import { prisma } from '../../config/prisma.js';

export const patientsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const patients = await prisma.patient.findMany({
      include: {
        user: { select: { email: true, phoneNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = patients.map((p) => {
      const birthYear = p.dateOfBirth.getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - birthYear;
      const fullName = `${p.firstName} ${p.lastName}`.trim();

      return {
        id: p.id,
        numericId: p.mrn,
        name: fullName,
        firstName: p.firstName,
        lastName: p.lastName,
        age: calculatedAge,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        phone: p.user?.phoneNumber || '+1234567890',
        email: p.user?.email,
        mrn: p.mrn,
        abhaId: p.abhaId,
        allergies: p.allergies,
        chronicConditions: p.chronicConditions,
        address: p.address,
        createdAt: p.createdAt,
      };
    });

    res.json(formatted);
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = String(req.params.id);

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id }, { mrn: id }, { userId: id }],
      },
      include: {
        user: { select: { email: true, phoneNumber: true } },
        prescriptions: { include: { items: true } },
        labOrders: { include: { items: { include: { testCatalog: true } } } },
      },
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        error: { code: 'PATIENT_NOT_FOUND', message: 'Patient record not found.' },
      });
      return;
    }

    if (req.user?.roles?.includes('PATIENT') && !req.user?.roles?.includes('DOCTOR')) {
      if (patient.userId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN_PHI_ACCESS', message: 'You are not authorized to view other patient records.' },
        });
        return;
      }
    }

    res.json({
      success: true,
      data: patient,
    });
  },
};
