import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateOtp, verifyOtp } from '../utils/otp.util.js';
import config from '../config/config.js';
import { prisma } from '../lib/db.js';

const otpStore = new Map(); // key: email (lowercase) or mobile (digits only)
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 min

function normalizeEmail(v) {
  return v ? String(v).trim().toLowerCase() : null;
}
function normalizeMobile(v) {
  return v ? String(v).replace(/\D/g, '') : null;
}

async function findUserByIdentifier(emailOrMobile) {
  if (!emailOrMobile) return null;
  const s = String(emailOrMobile).trim();
  const isEmail = s.includes('@');
  const where = isEmail
    ? { email: normalizeEmail(s) }
    : { mobile: normalizeMobile(s) };
  return prisma.users.findFirst({ where });
}

export async function sendOtp(emailOrMobile) {
  const email = normalizeEmail(emailOrMobile);
  const mobile = normalizeMobile(emailOrMobile);
  const key = email || mobile;
  if (!key) {
    throw Object.assign(new Error('Email or mobile is required'), { statusCode: 400 });
  }
  const otp = generateOtp(6);
  otpStore.set(key, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });
  return { message: 'OTP sent', otp: config.nodeEnv === 'development' ? otp : undefined };
}

export async function register({ name, email, mobile, password }) {
  if (!password || password.length < 6) {
    throw Object.assign(new Error('Password is required (min 6 characters)'), { statusCode: 400 });
  }
  const emailKey = normalizeEmail(email);
  const mobileKey = normalizeMobile(mobile);
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
  if (!key) throw Object.assign(new Error('Email or mobile is required'), { statusCode: 400 });
  const stored = otpStore.get(key);
  if (!stored) throw Object.assign(new Error('OTP not found or expired'), { statusCode: 400 });
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    throw Object.assign(new Error('OTP expired'), { statusCode: 400 });
  }
  if (!verifyOtp(stored.otp, String(otp))) throw Object.assign(new Error('Invalid OTP'), { statusCode: 401 });
  otpStore.delete(key);
  let user = await findUserByIdentifier(identifier);
  if (!user) {
    user = await prisma.users.create({
      data: {
        email: emailKey || null,
        mobile: mobileKey || null,
      },
    });
  }
  return signUser(user);
}

function toUserResponse(row) {
  return {
    id: String(row.id),
    name: row.name ?? undefined,
    email: row.email ?? undefined,
    mobile: row.mobile ?? undefined,
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
