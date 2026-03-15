import { prisma } from '../lib/db.js';

function toResponse(row) {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name ?? null,
    probability_field: row.probability_field,
    threshold_min: row.threshold_min != null ? Number(row.threshold_min) : null,
    alert_level_id: row.alert_level_id != null ? String(row.alert_level_id) : null,
    send_sms: row.send_sms,
    message_template: row.message_template ?? null,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

function withLevelName(r) {
  const out = toResponse(r);
  out.alert_level_name = r.alert_levels?.level_name ?? null;
  return out;
}

export async function findActiveRules() {
  const rows = await prisma.alert_automation_rules.findMany({
    where: { is_active: true },
    include: { alert_levels: true },
    orderBy: { id: 'asc' },
  });
  return rows.map(withLevelName);
}

/** List all rules; optional query active_only=false to include inactive. */
export async function findAll(activeOnly = false) {
  const where = activeOnly ? { is_active: true } : {};
  const rows = await prisma.alert_automation_rules.findMany({
    where,
    include: { alert_levels: true },
    orderBy: { id: 'asc' },
  });
  return rows.map(withLevelName);
}

export async function findById(id) {
  const row = await prisma.alert_automation_rules.findFirst({
    where: { id: BigInt(id) },
    include: { alert_levels: true },
  });
  return row ? withLevelName(row) : null;
}

export async function create(data) {
  const row = await prisma.alert_automation_rules.create({
    data: {
      name: data.name ?? null,
      probability_field: data.probability_field ?? 'Flood_Probability',
      threshold_min: data.threshold_min != null ? Number(data.threshold_min) : 0.8,
      alert_level_id: data.alert_level_id != null ? BigInt(data.alert_level_id) : null,
      send_sms: data.send_sms !== false,
      message_template: data.message_template ?? null,
      is_active: data.is_active !== false,
    },
    include: { alert_levels: true },
  });
  return withLevelName(row);
}

export async function update(id, data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name ?? null;
  if (data.probability_field !== undefined) payload.probability_field = data.probability_field;
  if (data.threshold_min !== undefined) payload.threshold_min = Number(data.threshold_min);
  if (data.alert_level_id !== undefined) payload.alert_level_id = data.alert_level_id == null ? null : BigInt(data.alert_level_id);
  if (data.send_sms !== undefined) payload.send_sms = data.send_sms === true;
  if (data.message_template !== undefined) payload.message_template = data.message_template ?? null;
  if (data.is_active !== undefined) payload.is_active = data.is_active === true;
  const row = await prisma.alert_automation_rules.update({
    where: { id: BigInt(id) },
    data: payload,
    include: { alert_levels: true },
  });
  return withLevelName(row);
}

export async function remove(id) {
  await prisma.alert_automation_rules.delete({ where: { id: BigInt(id) } });
}
