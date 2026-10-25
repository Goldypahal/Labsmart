import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireRole } from '../../middleware/authorize.js';

// Staff roles allowed to move an order through the lab workflow (interim, until the
// full permission matrix lands in T-016).
const LAB_STAFF = ['SUPER_ADMIN', 'LAB_ADMIN', 'LAB_SUPERVISOR', 'LAB_TECHNICIAN', 'RECEPTIONIST'];

export const ordersRouter = Router();

ordersRouter.get('/', authenticate, ordersController.list);
ordersRouter.get('/:id', authenticate, ordersController.getById);
ordersRouter.patch('/:id/status', authenticate, requireRole(...LAB_STAFF), ordersController.updateStatus);
ordersRouter.put('/:id/status', authenticate, requireRole(...LAB_STAFF), ordersController.updateStatus);

// The former PATCH/PUT /:id/upload-report route was removed (M0, T-002): it let any
// logged-in user release a report for any order without authorization. Report
// release returns with the authorization workflow (T-039) and PDF rendering (T-040).
