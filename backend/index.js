import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (isProduction ? null : 'development-only-secret-change-me');

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set when NODE_ENV is production.');
}

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

// This remains an MVP store. It is deliberately isolated here so it can be
// replaced by Prisma persistence without changing the HTTP contract.
const seedUsers = [
    { id: 1, email: 'doctor@diagconnect.com', password: 'password123', role: 'DOCTOR', name: 'Dr. Smith' },
    { id: 2, email: 'lab@diagconnect.com', password: 'password123', role: 'LAB_ADMIN', name: 'City Central Lab' },
    { id: 3, email: 'patient@diagconnect.com', password: 'password123', role: 'PATIENT', name: 'John Doe' },
];

const users = await Promise.all(seedUsers.map(async ({ password, ...user }) => ({
    ...user,
    passwordHash: await bcrypt.hash(password, 12),
})));

const patientsList = [
    { id: 3, name: 'John Doe', age: 45, phone: '+1234567890' },
    { id: 4, name: 'Jane Roe', age: 34, phone: '+1987654321' },
];

let prescriptions = [];
let testOrders = [];
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;

function getClientIp(req) {
    return req.ip || req.socket.remoteAddress || 'unknown';
}

function loginRateLimit(req, res, next) {
    const now = Date.now();
    const ip = getClientIp(req);
    const entry = loginAttempts.get(ip);
    if (!entry || now - entry.startedAt > LOGIN_WINDOW_MS) {
        loginAttempts.set(ip, { startedAt: now, count: 1 });
        return next();
    }
    if (entry.count >= MAX_LOGIN_ATTEMPTS) {
        return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    }
    entry.count += 1;
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
        next();
    };
}

function validId(value) {
    return Number.isSafeInteger(value) && value > 0;
}

function validTests(tests) {
    return Array.isArray(tests)
        && tests.length > 0
        && tests.length <= 30
        && tests.every((test) => typeof test === 'string' && test.trim().length > 0 && test.trim().length <= 120);
}

function serialiseOrder(order) {
    return { ...order, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt?.toISOString() };
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/login', loginRateLimit, async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = users.find((candidate) => candidate.email === email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    loginAttempts.delete(getClientIp(req));
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    try {
        req.user = jwt.verify(header.slice(7), JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
}

app.get('/api/patients', authenticate, requireRole('DOCTOR'), (_req, res) => res.json(patientsList));

app.post('/api/prescriptions', authenticate, requireRole('DOCTOR'), (req, res) => {
    const { patientId, tests } = req.body ?? {};
    if (!validId(patientId) || !patientsList.some((patient) => patient.id === patientId)) {
        return res.status(400).json({ message: 'A valid patientId is required.' });
    }
    if (!validTests(tests)) return res.status(400).json({ message: 'tests must be a non-empty array of test names.' });

    const createdAt = new Date();
    const newPrescription = {
        id: prescriptions.length + 1,
        doctorId: req.user.id,
        patientId,
        tests: tests.map((test) => test.trim()),
        status: 'PENDING',
        createdAt,
        updatedAt: createdAt,
    };
    prescriptions.push(newPrescription);

    const newOrder = {
        id: testOrders.length + 1,
        prescriptionId: newPrescription.id,
        labId: 2,
        status: 'RECEIVED',
        reportUrl: null,
        createdAt,
        updatedAt: createdAt,
        tests: newPrescription.tests,
    };
    testOrders.push(newOrder);
    res.status(201).json({ ...newPrescription, createdAt: createdAt.toISOString(), updatedAt: createdAt.toISOString() });
});

app.get('/api/prescriptions', authenticate, requireRole('DOCTOR'), (req, res) => {
    res.json(prescriptions.filter((prescription) => prescription.doctorId === req.user.id).map((prescription) => ({
        ...prescription,
        createdAt: prescription.createdAt.toISOString(),
        updatedAt: prescription.updatedAt.toISOString(),
    })));
});

app.patch('/api/prescriptions/:id', authenticate, requireRole('DOCTOR'), (req, res) => {
    const prescriptionId = Number(req.params.id);
    const prescription = prescriptions.find((item) => item.id === prescriptionId && item.doctorId === req.user.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found.' });
    if (prescription.status === 'COMPLETED') return res.status(409).json({ message: 'Completed prescriptions cannot be changed.' });
    const { tests } = req.body ?? {};
    if (!validTests(tests)) return res.status(400).json({ message: 'tests must be a non-empty array of test names.' });
    prescription.tests = tests.map((test) => test.trim());
    prescription.updatedAt = new Date();
    const order = testOrders.find((item) => item.prescriptionId === prescription.id);
    if (order) {
        order.tests = prescription.tests;
        order.updatedAt = prescription.updatedAt;
    }
    res.json({ ...prescription, createdAt: prescription.createdAt.toISOString(), updatedAt: prescription.updatedAt.toISOString() });
});

app.get('/api/orders', authenticate, (req, res) => {
    if (req.user.role === 'LAB_ADMIN') return res.json(testOrders.filter((order) => order.labId === req.user.id).map(serialiseOrder));
    if (req.user.role === 'PATIENT') {
        const patientPrescriptionIds = new Set(prescriptions.filter((prescription) => prescription.patientId === req.user.id).map((prescription) => prescription.id));
        return res.json(testOrders.filter((order) => patientPrescriptionIds.has(order.prescriptionId)).map(serialiseOrder));
    }
    res.status(403).json({ message: 'Forbidden' });
});

app.patch('/api/orders/:id/upload-report', authenticate, requireRole('LAB_ADMIN'), (req, res) => {
    const orderId = Number(req.params.id);
    const { reportUrl } = req.body ?? {};
    if (!validId(orderId)) return res.status(400).json({ message: 'A valid order id is required.' });
    if (typeof reportUrl !== 'string' || reportUrl.length > 2048) return res.status(400).json({ message: 'A valid reportUrl is required.' });
    try {
        const url = new URL(reportUrl);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    } catch {
        return res.status(400).json({ message: 'reportUrl must be an absolute HTTP(S) URL.' });
    }

    const order = testOrders.find((item) => item.id === orderId && item.labId === req.user.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    order.status = 'UPLOADED';
    order.reportUrl = reportUrl;
    order.updatedAt = new Date();
    const prescription = prescriptions.find((item) => item.id === order.prescriptionId);
    if (prescription) {
        prescription.status = 'COMPLETED';
        prescription.updatedAt = order.updatedAt;
    }
    res.json(serialiseOrder(order));
});

if (process.env.NODE_ENV !== 'test') {
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
}

export default app;
