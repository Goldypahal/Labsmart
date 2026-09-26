import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const ordersRouter = Router();

ordersRouter.get('/', authenticate, ordersController.list);
ordersRouter.get('/:id', authenticate, ordersController.getById);
ordersRouter.patch('/:id/status', authenticate, ordersController.updateStatus);
ordersRouter.put('/:id/status', authenticate, ordersController.updateStatus);
ordersRouter.patch('/:id/upload-report', authenticate, ordersController.uploadReport);
ordersRouter.put('/:id/upload-report', authenticate, ordersController.uploadReport);
