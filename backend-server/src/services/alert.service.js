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
  const rows = await prisma.alerts.findMany({
    orderBy: { issued_at: 'desc' },
    include: { alert_levels: true },
  });
  return rows.map((row) => {
    const out = toResponse(row);
    out.alert_type_name = row.alert_levels?.level_name ?? null;
    return out;
  });
}

export async function findAlertLevels() {
  const rows = await prisma.alert_levels.findMany({ orderBy: { severity_rank: 'asc' } });
  return rows.map((r) => ({ id: String(r.id), level_name: r.level_name, severity_rank: r.severity_rank }));
}

export async function createAlertLevel(data) {
  const row = await prisma.alert_levels.create({
    data: {
      level_name: data.level_name ?? null,
      severity_rank: data.severity_rank ?? null,
    },
  });
  return { id: String(row.id), level_name: row.level_name, severity_rank: row.severity_rank };
}

export async function updateAlertLevel(id, data) {
  const payload = {};
  if (data.level_name !== undefined) payload.level_name = data.level_name;
  if (data.severity_rank !== undefined) payload.severity_rank = data.severity_rank;
  const row = await prisma.alert_levels.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return { id: String(row.id), level_name: row.level_name, severity_rank: row.severity_rank };
}

export async function removeAlertLevel(id) {
  await prisma.alert_levels.delete({ where: { id: BigInt(id) } });
}

export async function findRegions() {
  const rows = await prisma.regions.findMany({ orderBy: { name: 'asc' } });
  return rows.map((r) => ({ id: String(r.id), name: r.name, type: r.type }));
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

function parseDate(v) {
  if (v == null || v === '') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function create(data) {
  const row = await prisma.alerts.create({
    data: {
      region_id: data.region_id != null ? BigInt(data.region_id) : null,
      prediction_id: data.prediction_id != null ? BigInt(data.prediction_id) : null,
      alert_level_id: data.alert_level_id != null ? BigInt(data.alert_level_id) : null,
      message: data.message ?? null,
      issued_at: parseDate(data.issued_at),
      expires_at: parseDate(data.expires_at),
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

/**
 * Send alert to all users: create alert in DB, then notify every user with email or mobile.
 */
async function notifyUsers(alertRow, users) {
  const message = alertRow.message || 'New alert issued.';
  const isDev = config.nodeEnv === 'development';
  const sent = { emails: 0, sms: 0 };

  if (isDev) {
    console.log('[Alert send] Would notify users:', users?.length ?? 0, users?.map((u) => u.email || u.mobile));
    return sent;
  }

  for (const user of users || []) {
    if (user.mobile) {
      try {
        await smsService.sendSms({ to: user.mobile, body: `Alert: ${message}` });
        sent.sms += 1;
      } catch (err) {
        console.error('[Alert] SMS failed:', user.mobile, err.message);
      }
    }
    if (user.email) {
      try {
        await emailService.sendEmail({
          to: user.email,
          subject: 'Alert notification',
          text: message,
          html: `<p>${message}</p>`,
        });
        sent.emails += 1;
      } catch (err) {
        console.error('[Alert] Email failed:', user.email, err.message);
      }
    }
  }
  return sent;
}

export async function sendAlertToUsers(data) {
  const row = await prisma.alerts.create({
    data: {
      region_id: data.region_id != null ? BigInt(data.region_id) : null,
      prediction_id: data.prediction_id != null ? BigInt(data.prediction_id) : null,
      alert_level_id: data.alert_level_id != null ? BigInt(data.alert_level_id) : null,
      message: data.message ?? null,
      issued_at: parseDate(data.issued_at),
      expires_at: parseDate(data.expires_at),
      status: data.status ?? 'active',
    },
  });
  const users = await prisma.users.findMany({
    where: {
      OR: [{ email: { not: null } }, { mobile: { not: null } }],
    },
    select: { email: true, mobile: true },
  });
  try {
    const sent = await notifyUsers(row, users);
    return { ...toResponse(row), notified: sent };
  } catch (err) {
    if (config.nodeEnv === 'development') {
      console.log('[Alert] Send to users (dev):', err.message);
    } else {
      console.error('[Alert] Send to users failed:', err.message);
    }
    return toResponse(row);
  }
}

export async function update(id, data) {
  const payload = {};
  if (data.region_id !== undefined) payload.region_id = data.region_id == null ? null : BigInt(data.region_id);
  if (data.prediction_id !== undefined) payload.prediction_id = data.prediction_id == null ? null : BigInt(data.prediction_id);
  if (data.alert_level_id !== undefined) payload.alert_level_id = data.alert_level_id == null ? null : BigInt(data.alert_level_id);
  if (data.message !== undefined) payload.message = data.message;
  if (data.issued_at !== undefined) payload.issued_at = parseDate(data.issued_at);
  if (data.expires_at !== undefined) payload.expires_at = parseDate(data.expires_at);
  if (data.status !== undefined) payload.status = data.status;
  const row = await prisma.alerts.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return toResponse(row);
}

export async function remove(id) {
  await prisma.alerts.delete({ where: { id: BigInt(id) } });
}

/**
 * Resend an existing alert to all users (email/SMS). Does not create a new alert.
 */
export async function resendToUsers(id) {
  const row = await prisma.alerts.findFirst({ where: { id: BigInt(id) } });
  if (!row) return null;
  const users = await prisma.users.findMany({
    where: {
      OR: [{ email: { not: null } }, { mobile: { not: null } }],
    },
    select: { email: true, mobile: true },
  });
  let sent = { emails: 0, sms: 0 };
  try {
    sent = await notifyUsers(row, users);
  } catch (err) {
    if (config.nodeEnv === 'development') {
      console.log('[Alert] Resend (dev):', err.message);
    } else {
      console.error('[Alert] Resend failed:', err.message);
    }
  }
  return { alert: toResponse(row), notified: sent };
}
