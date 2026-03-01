import express from 'express';
import * as predictionController from '../controllers/prediction.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/predictions:
 *   get:
 *     summary: List all predictions
 *     tags: [Predictions]
 *     responses:
 *       200:
 *         description: List of predictions
 */
router.get('/', predictionController.getPredictions);

/**
 * @openapi
 * /api/predictions/{id}:
 *   get:
 *     summary: Get prediction by ID
 *     tags: [Predictions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prediction details
 */
router.get('/:id', predictionController.getPredictionById);

/**
 * @openapi
 * /api/predictions:
 *   post:
 *     summary: Create a prediction
 *     tags: [Predictions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created prediction
 */
router.post('/', predictionController.createPrediction);

export default router;
