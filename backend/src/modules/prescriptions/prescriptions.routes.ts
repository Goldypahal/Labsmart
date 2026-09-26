import { Router } from 'express';
import { prescriptionsController } from './prescriptions.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const prescriptionsRouter = Router();

prescriptionsRouter.post('/', authenticate, prescriptionsController.create);
prescriptionsRouter.get('/', authenticate, prescriptionsController.list);
prescriptionsRouter.patch('/:id', authenticate, prescriptionsController.update);
