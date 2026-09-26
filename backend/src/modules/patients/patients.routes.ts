import { Router } from 'express';
import { patientsController } from './patients.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const patientsRouter = Router();

patientsRouter.get('/', authenticate, patientsController.list);
patientsRouter.get('/:id', authenticate, patientsController.getById);
