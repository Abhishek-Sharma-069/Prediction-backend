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
 * /api/alerts/levels:
 *   get:
 *     summary: List alert levels (alert types)
 *     tags: [Alerts]
 *   post:
 *     summary: Create alert level (type)
 *     tags: [Alerts]
 */
router.get('/levels', alertController.getAlertLevels);
router.post('/levels', alertController.createAlertLevel);
router.put('/levels/:id', alertController.updateAlertLevel);
router.delete('/levels/:id', alertController.deleteAlertLevel);

/**
 * @openapi
 * /api/alerts/regions:
 *   get:
 *     summary: List regions (for dropdowns)
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of regions
 */
router.get('/regions', alertController.getRegions);

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
 * /api/alerts/send:
 *   post:
 *     summary: Create alert and send to all users (email/SMS)
 *     tags: [Alerts]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message: { type: string }
 *               status: { type: string }
 *     responses:
 *       201:
 *         description: Alert created and users notified
 */
router.post('/send', alertController.sendAlert);

router.post('/:id/resend', alertController.resendAlert);

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
router.delete('/:id', alertController.deleteAlert);

export default router;
