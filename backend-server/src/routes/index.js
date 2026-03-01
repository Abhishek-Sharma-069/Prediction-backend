import express from 'express';
import sensorRoutes from './sensor.routes.js';
import predictionRoutes from './prediction.routes.js';
import alertRoutes from './alert.routes.js';
import userRoutes from './user.routes.js';

const router = express.Router();
router.use('/sensors', sensorRoutes);
router.use('/predictions', predictionRoutes);
router.use('/alerts', alertRoutes);
router.use('/users', userRoutes);

export default router;
