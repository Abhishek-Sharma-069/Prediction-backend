import express from 'express';
import * as alertController from '../controllers/alert.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/alerts:
 *   get:
 *     summary: List all alerts
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of alerts
 */
router.get('/', alertController.getAlerts);

/**
 * @openapi
 * /api/alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert details
 */
router.get('/:id', alertController.getAlertById);

/**
 * @openapi
 * /api/alerts:
 *   post:
 *     summary: Create an alert
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created alert
 */
router.post('/', alertController.createAlert);

/**
 * @openapi
 * /api/alerts/{id}:
 *   put:
 *     summary: Update an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated alert
 */
router.put('/:id', alertController.updateAlert);

export default router;
