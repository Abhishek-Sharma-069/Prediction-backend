import express from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to email or mobile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               mobile:
 *                 type: string
 *             description: Provide exactly one of email or mobile
 *     responses:
 *       200:
 *         description: OTP sent (in development, OTP is returned in response)
 *       400:
 *         description: Email or mobile required
 */
router.post('/send-otp', authController.sendOtp);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *             description: Provide at least one of email or mobile; password is required (stored hashed)
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists (email or mobile)
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login with email or mobile + password or OTP (one identifier, one credential at a time)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               mobile:
 *                 type: string
 *               password:
 *                 type: string
 *               otp:
 *                 type: string
 *             description: Provide exactly one of (email | mobile) and exactly one of (password | otp)
 *     responses:
 *       200:
 *         description: Logged in; token set in cookie and returned in body
 *       400:
 *         description: Invalid request (e.g. both password and otp, or missing identifier/credential)
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

export default router;
