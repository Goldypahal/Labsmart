import { Router } from 'express';
import { authRouter } from '../../modules/auth/auth.routes.js';
import { patientsRouter } from '../../modules/patients/patients.routes.js';
import { prescriptionsRouter } from '../../modules/prescriptions/prescriptions.routes.js';
import { ordersRouter } from '../../modules/orders/orders.routes.js';
import { testsRouter } from '../../modules/tests/tests.routes.js';
import { reviewsRouter } from '../../modules/reviews/reviews.routes.js';

export const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/patients', patientsRouter);
v1Router.use('/prescriptions', prescriptionsRouter);
v1Router.use('/orders', ordersRouter);
v1Router.use('/tests', testsRouter);
v1Router.use('/reviews', reviewsRouter);
