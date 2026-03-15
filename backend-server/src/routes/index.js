import express from 'express';
import authRoutes from './auth.routes.js';
import sensorRoutes from './sensor.routes.js';
import predictionRoutes from './prediction.routes.js';
import alertRoutes from './alert.routes.js';
import userRoutes from './user.routes.js';
import mlRoutes from './ml.routes.js';
import regionRoutes from './region.routes.js';
import roleRoutes from './role.routes.js';
import mlModelRoutes from './mlModel.routes.js';
import automationRoutes from './automation.routes.js';

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/sensors', sensorRoutes);
router.use('/predictions', predictionRoutes);
router.use('/alerts', alertRoutes);
router.use('/users', userRoutes);
router.use('/ml', mlRoutes);
router.use('/regions', regionRoutes);
router.use('/roles', roleRoutes);
router.use('/models', mlModelRoutes);
router.use('/automation', automationRoutes);

export default router;
