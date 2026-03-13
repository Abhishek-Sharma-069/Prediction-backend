import twilio from 'twilio';
import config from '../config/config.js';

const isDev = config.nodeEnv === 'development';

function getClient() {
  if (!config.twilioAccountSid || !config.twilioAuthToken) {
    return null;
  }
  return twilio(config.twilioAccountSid, config.twilioAuthToken);
}

/**
 * Ensure phone number is E.164 (e.g. +919876543210).
 * If no leading +, prepends default country code when set.
 */
export function toE164(mobile) {
  const digits = String(mobile).replace(/\D/g, '');
  if (!digits) return null;
  if (String(mobile).trim().startsWith('+')) return `+${digits}`;
  const cc = (config.defaultSmsCountryCode || '').replace(/\D/g, '');
  if (cc) return `+${cc}${digits}`;
  return `+${digits}`;
}

/**
 * Send SMS via Twilio.
 * In development: logs to console and returns { dev: true, to, body }; does not call Twilio.
 * @param {{ to: string, body: string }} options
 * @returns {Promise<{ sid?: string, dev?: boolean, to: string, body: string }>}
 */
export async function sendSms({ to, body }) {
  const toE164Number = toE164(to);
  if (!toE164Number) {
    throw new Error('Invalid SMS recipient number');
  }

  if (isDev) {
    console.log('[SMS (dev)]', { to: toE164Number, body });
    return { dev: true, to: toE164Number, body };
  }

  const client = getClient();
  if (!client) {
    console.warn('[SMS] Twilio not configured; skipping send.', { to: toE164Number, body });
    return { dev: false, to: toE164Number, body };
  }

  const message = await client.messages.create({
    body,
    from: config.twilioPhoneNumber,
    to: toE164Number,
  });
  return { sid: message.sid, to: toE164Number, body };
}
