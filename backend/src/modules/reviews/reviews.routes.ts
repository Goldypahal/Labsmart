import { Router } from 'express';
import { reviewsController } from './reviews.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const reviewsRouter = Router();

reviewsRouter.get('/', reviewsController.list);
reviewsRouter.post('/', authenticate, reviewsController.submit);
