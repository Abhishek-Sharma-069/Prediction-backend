import * as authService from '../services/auth.service.js';
import config from '../config/config.js';

export async function sendOtp(req, res, next) {
  try {
    const { email, mobile, countryCode } = req.body;
    const result = await authService.sendOtp({ email, mobile, countryCode });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, mobile, password, countryCode } = req.body;
    const user = await authService.register({ name, email, mobile, password, countryCode });
    res.status(201).json({ message: 'Registered successfully', user });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, mobile, password, otp, countryCode } = req.body;
    const identifier = email || (mobile ? authService.toE164(mobile, countryCode) : null);
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

    const allRoles = await authService.getAllRoles();
    res.json({ message: 'Logged in', user, allRoles });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}
