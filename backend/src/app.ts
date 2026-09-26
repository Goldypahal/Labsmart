import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.js';
import { v1Router } from './routes/v1/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { authController } from './modules/auth/auth.controller.js';
import { patientsRouter } from './modules/patients/patients.routes.js';
import { prescriptionsRouter } from './modules/prescriptions/prescriptions.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { reviewsRouter } from './modules/reviews/reviews.routes.js';

export const app = express();

app.disable('x-powered-by');

const allowedOrigins = ENV.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Healthcheck endpoints
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0' }));
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', version: '2.0.0' }));

// Versioned API v1 Router
app.use('/api/v1', v1Router);

// Backward-Compatibility Aliases for /api/* during frontend transition
app.post('/api/auth/login', authController.login);
app.use('/api/patients', patientsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);

// Centralized error handler
app.use(errorHandler);
