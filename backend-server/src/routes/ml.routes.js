import express from 'express';
import * as mlController from '../controllers/ml.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/ml/predict:
 *   post:
 *     summary: Predict by feature values (real environment)
 *     description: |
 *       Sends feature rows to the ML service. Each row must contain the same keys as the
 *       model's training features (e.g. TOTRF, RD, RH, DBT, MWS, MSLP and any other
 *       columns from the training data). Returns Flood_State, Cyclone_State, and optionally
 *       Flood_Probability, Cyclone_Probability per row.
 *     tags: [ML]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rows
 *             properties:
 *               rows:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   description: One row of feature values (keys = feature column names)
 *               model_path:
 *                 type: string
 *                 nullable: true
 *               probabilities:
 *                 type: boolean
 *                 default: true
 *           example:
 *             rows:
 *               - TOTRF: 120.5
 *                 RD: 10.2
 *                 RH: 85.0
 *                 DBT: 28.5
 *                 MWS: 45.0
 *                 MSLP: 998.2
 *             probabilities: true
 *     responses:
 *       200:
 *         description: Prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Flood_State: { type: integer }
 *                       Cyclone_State: { type: integer }
 *                       Flood_Probability: { type: number }
 *                       Cyclone_Probability: { type: number }
 *       502:
 *         description: ML service unavailable
 */
router.post('/predict', mlController.predict);

/**
 * @openapi
 * /api/ml/predict-by-excel:
 *   post:
 *     summary: Predict by Excel file (testing on dataset)
 *     description: |
 *       Sends the path to an Excel file to the ML service. The file must be readable by the
 *       ML service (same schema as training data). Returns predictions per row.
 *     tags: [ML]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data_path
 *             properties:
 *               data_path:
 *                 type: string
 *                 description: Absolute path to the Excel file on the ML service server
 *               model_path:
 *                 type: string
 *                 nullable: true
 *               probabilities:
 *                 type: boolean
 *                 default: true
 *           example:
 *             data_path: "/home/abhishek-sharma/Desktop/Project/ml_service/data/Balood_data.xlsx"
 *             model_path: null
 *             probabilities: true
 *     responses:
 *       200:
 *         description: Prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rows:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Flood_State: { type: integer }
 *                       Cyclone_State: { type: integer }
 *                       Flood_Probability: { type: number }
 *                       Cyclone_Probability: { type: number }
 *       502:
 *         description: ML service unavailable
 */
router.post('/predict-by-excel', mlController.predictByExcel);

export default router;
