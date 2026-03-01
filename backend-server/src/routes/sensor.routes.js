import express from 'express';
import * as sensorController from '../controllers/sensor.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/sensors:
 *   get:
 *     summary: List all sensors
 *     tags: [Sensors]
 *     responses:
 *       200:
 *         description: List of sensors
 */
router.get('/', sensorController.getSensors);

/**
 * @openapi
 * /api/sensors/{id}:
 *   get:
 *     summary: Get sensor by ID
 *     tags: [Sensors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sensor details
 */
router.get('/:id', sensorController.getSensorById);

/**
 * @openapi
 * /api/sensors:
 *   post:
 *     summary: Create a sensor
 *     tags: [Sensors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created sensor
 */
router.post('/', sensorController.createSensor);

/**
 * @openapi
 * /api/sensors/{id}:
 *   put:
 *     summary: Update a sensor
 *     tags: [Sensors]
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
 *         description: Updated sensor
 */
router.put('/:id', sensorController.updateSensor);

/**
 * @openapi
 * /api/sensors/{id}:
 *   delete:
 *     summary: Delete a sensor
 *     tags: [Sensors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Sensor deleted
 */
router.delete('/:id', sensorController.deleteSensor);

export default router;
