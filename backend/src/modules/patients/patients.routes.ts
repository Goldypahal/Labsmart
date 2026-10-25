import { Router } from 'express';
import { patientsController } from './patients.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';

// Interim (M0): patient accounts may not list all patients. Doctors still see the
// full list until referrer scoping lands (T-017).
const STAFF_AND_DOCTORS = ['SUPER_ADMIN', 'LAB_ADMIN', 'LAB_SUPERVISOR', 'LAB_TECHNICIAN', 'RECEPTIONIST', 'BILLING', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'];

export const patientsRouter = Router();

patientsRouter.get('/', authenticate, requireRole(...STAFF_AND_DOCTORS), patientsController.list);
patientsRouter.get('/:id', authenticate, patientsController.getById);
