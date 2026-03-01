import * as authService from '../services/auth.service.js';
import config from '../config/config.js';

export async function sendOtp(req, res, next) {
  try {
    const { email, mobile } = req.body;
    const identifier = email || mobile;
    const result = await authService.sendOtp(identifier);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, mobile, password } = req.body;
    const user = await authService.register({ name, email, mobile, password });
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, mobile, password, otp } = req.body;
    const identifier = email || mobile;
    const hasPassword = password !== undefined && password !== null && String(password).trim() !== '';
    const hasOtp = otp !== undefined && otp !== null && String(otp).trim() !== '';

    if (!identifier) {
      const err = new Error('Email or mobile is required');
      err.statusCode = 400;
      return next(err);
    }
    if (hasPassword && hasOtp) {
      const err = new Error('Use either password or OTP, not both');
      err.statusCode = 400;
      return next(err);
    }
    if (!hasPassword && !hasOtp) {
      const err = new Error('Password or OTP is required');
      err.statusCode = 400;
      return next(err);
    }

    const result = hasOtp
      ? await authService.loginWithOtp(identifier, otp)
      : await authService.loginWithPassword(identifier, password);

    const { token, user } = result;
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: config.cookieMaxAge,
      sameSite: 'lax',
    });
    res.json({ message: 'Logged in', user, token });
  } catch (err) {
    next(err);
  }
}
