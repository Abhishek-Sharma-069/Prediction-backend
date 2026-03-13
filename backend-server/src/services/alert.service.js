import { prisma } from '../lib/db.js';
import config from '../config/config.js';
import * as smsService from './sms.service.js';
import * as emailService from './email.service.js';

function toResponse(row) {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    region_id: row.region_id != null ? String(row.region_id) : null,
    prediction_id: row.prediction_id != null ? String(row.prediction_id) : null,
    alert_level_id: row.alert_level_id != null ? String(row.alert_level_id) : null,
  };
}

export async function findAll() {
  const rows = await prisma.alerts.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toResponse);
}

export async function findById(id) {
  const row = await prisma.alerts.findFirst({ where: { id: BigInt(id) } });
  return toResponse(row);
}

async function notifyAlert(alertRow) {
  const message = alertRow.message || 'New alert issued.';
  const isDev = config.nodeEnv === 'development';
  const phones = config.alertNotifyPhones || [];
  const emails = config.alertNotifyEmails || [];

  if (isDev) {
    console.log('[Alert (dev)]', {
      alertId: String(alertRow.id),
      message,
      wouldNotifyPhones: phones.length ? phones : '(none configured)',
      wouldNotifyEmails: emails.length ? emails : '(none configured)',
    });
    return;
  }

  for (const to of phones) {
    try {
      await smsService.sendSms({ to, body: `Alert: ${message}` });
    } catch (err) {
      console.error('[Alert] SMS failed:', to, err.message);
    }
  }
  for (const to of emails) {
    try {
      await emailService.sendEmail({
        to,
        subject: 'Alert notification',
        text: message,
        html: `<p>${message}</p>`,
      });
    } catch (err) {
      console.error('[Alert] Email failed:', to, err.message);
    }
  }
}

export async function create(data) {
  const row = await prisma.alerts.create({
    data: {
      region_id: data.region_id != null ? BigInt(data.region_id) : null,
      prediction_id: data.prediction_id != null ? BigInt(data.prediction_id) : null,
      alert_level_id: data.alert_level_id != null ? BigInt(data.alert_level_id) : null,
      message: data.message ?? null,
      issued_at: data.issued_at ?? null,
      expires_at: data.expires_at ?? null,
      status: data.status ?? null,
    },
  });
  try {
    await notifyAlert(row);
  } catch (err) {
    if (config.nodeEnv === 'development') {
      console.log('[Alert] Notify (dev):', err.message);
    } else {
      console.error('[Alert] Notify failed:', err.message);
    }
  }
  return toResponse(row);
}

export async function update(id, data) {
  const payload = {};
  if (data.region_id !== undefined) payload.region_id = data.region_id == null ? null : BigInt(data.region_id);
  if (data.prediction_id !== undefined) payload.prediction_id = data.prediction_id == null ? null : BigInt(data.prediction_id);
  if (data.alert_level_id !== undefined) payload.alert_level_id = data.alert_level_id == null ? null : BigInt(data.alert_level_id);
  if (data.message !== undefined) payload.message = data.message;
  if (data.issued_at !== undefined) payload.issued_at = data.issued_at;
  if (data.expires_at !== undefined) payload.expires_at = data.expires_at;
  if (data.status !== undefined) payload.status = data.status;
  const row = await prisma.alerts.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return toResponse(row);
}
