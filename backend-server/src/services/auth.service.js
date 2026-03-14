import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateOtp, verifyOtp } from '../utils/otp.util.js';
import config from '../config/config.js';
import { prisma } from '../lib/db.js';
import * as smsService from './sms.service.js';
import * as emailService from './email.service.js';

function normalizeEmail(v) {
  return v ? String(v).trim().toLowerCase() : null;
}
function normalizeMobile(v) {
  return v ? String(v).replace(/\D/g, '') : null;
}

/**
 * Build E.164 mobile string (e.g. +918931929272).
 * @param {string} mobile - digits or number with/without +
 * @param {string} [countryCode] - e.g. "91" or "+91"; falls back to config.defaultSmsCountryCode
 */
export function toE164(mobile, countryCode) {
  const digits = String(mobile ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (String(mobile).trim().startsWith('+')) return `+${digits}`;
  const cc = (countryCode ?? config.defaultSmsCountryCode ?? '').replace(/\D/g, '');
  return cc ? `+${cc}${digits}` : `+${digits}`;
}

async function findUserByIdentifier(emailOrMobile) {
  if (!emailOrMobile) return null;
  const s = String(emailOrMobile).trim();
  const isEmail = s.includes('@');
  const where = isEmail
    ? { email: normalizeEmail(s) }
    : { mobile: s };
  return prisma.users.findFirst({
    where,
    include: {
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}

function buildIdentifier(email, mobile, countryCode) {
  if (email && String(email).trim().includes('@')) return String(email).trim();
  if (mobile) return toE164(mobile, countryCode);
  return null;
}

export async function sendOtp({ email, mobile, countryCode } = {}) {
  const identifier = buildIdentifier(email, mobile, countryCode);
  if (!identifier) {
    throw Object.assign(new Error('Email or mobile is required'), { statusCode: 400 });
  }
  const s = identifier;
  const isEmail = s.includes('@');
  const emailVal = isEmail ? normalizeEmail(s) : null;
  const mobileVal = !isEmail ? s : null;

  // Only allow OTP for existing users
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error('User not found for this email/mobile'), { statusCode: 404 });
  }

  const otp = generateOtp(6);
  const otpString = String(otp).trim();

  // Persist the OTP directly in the existing user row (explicit string for DB)
  await prisma.users.update({
    where: { id: user.id },
    data: { otp: otpString },
  });

  // Production: send OTP via Twilio SMS (mobile) or email (email). Development: no real send (sms/email services log only).
  const otpBody = `Your OTP is: ${otp}`;
  const isDev = config.nodeEnv === 'development';
  try {
    if (emailVal) {
      await emailService.sendEmail({
        to: emailVal,
        subject: 'Your OTP',
        text: otpBody,
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
      });
    } else if (mobileVal) {
      await smsService.sendSms({ to: mobileVal, body: otpBody });
    }
  } catch (err) {
    if (isDev) {
      console.log('[OTP] Send skipped (dev):', err.message);
    } else {
      throw err;
    }
  }

  // Development: OTP in response for convenience. Production: never include OTP in response (sent only via SMS/email).
  return { message: 'OTP sent', otp: isDev ? otp : undefined };
}

export async function register({ name, email, mobile, password, countryCode }) {
  if (!password || password.length < 6) {
    throw Object.assign(new Error('Password is required (min 6 characters)'), { statusCode: 400 });
  }
  const emailKey = normalizeEmail(email);
  const mobileKey = mobile ? toE164(mobile, countryCode) : null;
  if (!emailKey && !mobileKey) {
    throw Object.assign(new Error('Email or mobile is required'), { statusCode: 400 });
  }
  if (emailKey) {
    const existing = await prisma.users.findFirst({ where: { email: emailKey } });
    if (existing) throw Object.assign(new Error('User already exists with this email'), { statusCode: 409 });
  }
  if (mobileKey) {
    const existing = await prisma.users.findFirst({ where: { mobile: mobileKey } });
    if (existing) throw Object.assign(new Error('User already exists with this mobile'), { statusCode: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: {
      name: name || null,
      email: emailKey || null,
      mobile: mobileKey || null,
      password_hash: passwordHash,
    },
    include: {
      user_roles: { include: { roles: true } },
    },
  });
  return toUserResponse(user);
}

export async function loginWithPassword(identifier, password) {
  const user = await findUserByIdentifier(identifier);
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  if (!user.password_hash) throw Object.assign(new Error('Password not set for this account'), { statusCode: 401 });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  return signUser(user);
}

export async function loginWithOtp(identifier, otp) {
  const emailKey = normalizeEmail(identifier);
  const mobileKey = normalizeMobile(identifier);
  const key = emailKey || mobileKey;
  if (!key) {
    throw Object.assign(new Error('Email or mobile is required'), { statusCode: 400 });
  }

  // Find the same user that was used in sendOtp (same identifier normalization)
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 401 });
  }

  const storedOtp = user.otp != null ? String(user.otp).trim() : '';
  if (storedOtp.length === 0) {
    throw Object.assign(new Error('OTP not found or expired'), { statusCode: 400 });
  }

  const receivedOtp = otp != null ? String(otp).trim() : '';
  if (!verifyOtp(storedOtp, receivedOtp)) {
    throw Object.assign(new Error('Invalid OTP'), { statusCode: 401 });
  }

  // Clear OTP after successful use
  await prisma.users.update({
    where: { id: user.id },
    data: { otp: null },
  });

  return signUser(user);
}

function toUserResponse(row) {
  const roleNames = (row.user_roles || [])
    .map((ur) => ur.roles?.role_name)
    .filter(Boolean);
  const role = roleNames[0] ?? null;
  return {
    id: String(row.id),
    name: row.name ?? undefined,
    email: row.email ?? undefined,
    mobile: row.mobile ?? undefined,
    role: role ?? undefined,
    role_name: role ?? undefined,
    roles: roleNames.length ? roleNames : undefined,
  };
}

function signUser(row) {
  const token = jwt.sign(
    { sub: String(row.id), email: row.email, mobile: row.mobile },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );
  return {
    token,
    user: toUserResponse(row),
  };
}

/** All roles in the DB (for admin UI / role dropdowns). */
export async function getAllRoles() {
  const rows = await prisma.roles.findMany({ orderBy: { id: 'asc' } });
  return rows.map((r) => ({
    id: String(r.id),
    role_name: r.role_name ?? undefined,
    description: r.description ?? undefined,
  }));
}
