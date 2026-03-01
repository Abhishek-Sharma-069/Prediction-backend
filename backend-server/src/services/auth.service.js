import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateOtp, verifyOtp } from '../utils/otp.util.js';
import config from '../config/config.js';

// In-memory store (replace with Prisma when DB is ready)
const usersByEmail = new Map();
const usersByMobile = new Map();
const otpStore = new Map(); // key: email (lowercase) or mobile (digits only)
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 min

function normalizeEmail(v) {
  return v ? String(v).trim().toLowerCase() : null;
}
function normalizeMobile(v) {
  return v ? String(v).replace(/\D/g, '') : null;
}

function getUserByEmail(email) {
  const key = normalizeEmail(email);
  return key ? usersByEmail.get(key) : null;
}
function getUserByMobile(mobile) {
  const key = normalizeMobile(mobile);
  return key ? usersByMobile.get(key) : null;
}
function findUserByIdentifier(emailOrMobile) {
  if (!emailOrMobile) return null;
  const s = String(emailOrMobile).trim();
  if (s.includes('@')) return getUserByEmail(s);
  return getUserByMobile(s);
}

function indexUser(user) {
  if (user.email) usersByEmail.set(normalizeEmail(user.email), user);
  if (user.mobile) usersByMobile.set(normalizeMobile(user.mobile), user);
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
  if (!password || (password.length < 6)) {
    throw Object.assign(new Error('Password is required (min 6 characters)'), { statusCode: 400 });
  }
  const emailKey = normalizeEmail(email);
  const mobileKey = normalizeMobile(mobile);
  if (!emailKey && !mobileKey) {
    throw Object.assign(new Error('Email or mobile is required'), { statusCode: 400 });
  }
  if (emailKey && usersByEmail.has(emailKey)) {
    throw Object.assign(new Error('User already exists with this email'), { statusCode: 409 });
  }
  if (mobileKey && usersByMobile.has(mobileKey)) {
    throw Object.assign(new Error('User already exists with this mobile'), { statusCode: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: String(Date.now()),
    name: name || null,
    email: emailKey || null,
    mobile: mobileKey || null,
    passwordHash,
    createdAt: new Date(),
  };
  indexUser(user);
  return { id: user.id, name: user.name, email: user.email, mobile: user.mobile };
}

export async function loginWithPassword(identifier, password) {
  const user = findUserByIdentifier(identifier);
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }
  if (!user.passwordHash) {
    throw Object.assign(new Error('Password not set for this account'), { statusCode: 401 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }
  return signUser(user);
}

export async function loginWithOtp(identifier, otp) {
  const emailKey = normalizeEmail(identifier);
  const mobileKey = normalizeMobile(identifier);
  const key = emailKey || mobileKey;
  if (!key) {
    throw Object.assign(new Error('Email or mobile is required'), { statusCode: 400 });
  }
  const stored = otpStore.get(key);
  if (!stored) {
    throw Object.assign(new Error('OTP not found or expired'), { statusCode: 400 });
  }
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    throw Object.assign(new Error('OTP expired'), { statusCode: 400 });
  }
  if (!verifyOtp(stored.otp, String(otp))) {
    throw Object.assign(new Error('Invalid OTP'), { statusCode: 401 });
  }
  otpStore.delete(key);
  let user = findUserByIdentifier(identifier);
  if (!user) {
    user = {
      id: String(Date.now()),
      name: null,
      email: emailKey || null,
      mobile: mobileKey || null,
      passwordHash: null,
      createdAt: new Date(),
    };
    indexUser(user);
  }
  return signUser(user);
}

function signUser(user) {
  const token = jwt.sign(
    { sub: user.id, email: user.email, mobile: user.mobile },
    config.jwtSecret,
    { expiresIn: config.jwtExpiry }
  );
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile },
  };
}
