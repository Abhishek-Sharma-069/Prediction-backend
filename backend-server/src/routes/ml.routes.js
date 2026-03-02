import express from 'express';
import * as mlController from '../controllers/ml.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/ml/predict:
 *   post:
 *     summary: Run ML prediction using the external ML service
 *     tags: [ML]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_path:
 *                 type: string
 *                 description: Absolute path to the Excel file accessible by the ML service
 *               model_path:
 *                 type: string
 *               probabilities:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Prediction result
 */
router.post('/predict', mlController.predict);

export default router;

