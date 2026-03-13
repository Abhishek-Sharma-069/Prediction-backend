import nodemailer from 'nodemailer';
import config from '../config/config.js';

const isDev = config.nodeEnv === 'development';

function getTransport() {
  if (!config.smtpHost || !config.smtpUser) {
    return null;
  }
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

/**
 * Send email via SMTP.
 * In development: logs to console and returns { dev: true, to, subject }; does not send.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 * @returns {Promise<{ messageId?: string, dev?: boolean, to: string, subject: string }>}
 */
export async function sendEmail({ to, subject, text = '', html }) {
  const toAddress = String(to).trim().toLowerCase();
  if (!toAddress || !toAddress.includes('@')) {
    throw new Error('Invalid email recipient');
  }

  if (isDev) {
    console.log('[Email (dev)]', { to: toAddress, subject, text: text?.slice(0, 80) });
    return { dev: true, to: toAddress, subject };
  }

  const transport = getTransport();
  if (!transport) {
    console.warn('[Email] SMTP not configured; skipping send.', { to: toAddress, subject });
    return { dev: false, to: toAddress, subject };
  }

  const info = await transport.sendMail({
    from: config.mailFrom,
    to: toAddress,
    subject,
    text: text || undefined,
    html: html || text || undefined,
  });
  return { messageId: info.messageId, to: toAddress, subject };
}
