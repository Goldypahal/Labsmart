import { Router } from 'express';
import { testsController } from './tests.controller.js';

export const testsRouter = Router();

testsRouter.get('/', testsController.list);
testsRouter.get('/:id', testsController.getById);
