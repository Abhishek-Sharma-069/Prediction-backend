import express from 'express';
import * as automationController from '../controllers/automation.controller.js';

const router = express.Router();

/**
 * @openapi
 * /automation/run:
 *   post:
 *     summary: Run automation job once (weather → ML → alert rules → create alerts / SMS)
 *     tags: [Automation]
 *     responses:
 *       200:
 *         description: Job result (regionsProcessed, predictionsCreated, alertsCreated, errors)
 */
router.get('/config', automationController.getConfig);
router.post('/run', automationController.runJob);

router.get('/rules', automationController.getRules);
router.get('/rules/:id', automationController.getRuleById);
router.post('/rules', automationController.createRule);
router.put('/rules/:id', automationController.updateRule);
router.delete('/rules/:id', automationController.deleteRule);

export default router;
