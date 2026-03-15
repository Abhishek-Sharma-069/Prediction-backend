import { prisma } from '../lib/db.js';

function toResponse(row) {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    population: row.population != null ? String(row.population) : null,
  };
}

export async function findAll() {
  const rows = await prisma.regions.findMany({ orderBy: { name: 'asc' } });
  return rows.map(toResponse);
}

export async function findById(id) {
  const row = await prisma.regions.findFirst({ where: { id: BigInt(id) } });
  return toResponse(row);
}

export async function create(data) {
  const row = await prisma.regions.create({
    data: {
      name: data.name ?? null,
      type: data.type ?? null,
      population: data.population != null ? BigInt(data.population) : null,
      risk_zone_level: data.risk_zone_level ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      timezone: data.timezone ?? null,
      auto_predict_enabled: data.auto_predict_enabled ?? false,
    },
  });
  return toResponse(row);
}

export async function update(id, data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.type !== undefined) payload.type = data.type;
  if (data.population !== undefined) payload.population = data.population == null ? null : BigInt(data.population);
  if (data.risk_zone_level !== undefined) payload.risk_zone_level = data.risk_zone_level;
  if (data.latitude !== undefined) payload.latitude = data.latitude ?? null;
  if (data.longitude !== undefined) payload.longitude = data.longitude ?? null;
  if (data.timezone !== undefined) payload.timezone = data.timezone ?? null;
  if (data.auto_predict_enabled !== undefined) payload.auto_predict_enabled = data.auto_predict_enabled === true;
  const row = await prisma.regions.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return toResponse(row);
}

export async function remove(id) {
  await prisma.regions.delete({ where: { id: BigInt(id) } });
}

/** Regions that have auto_predict_enabled and valid latitude/longitude (for automation job). */
export async function findAutoPredictRegions() {
  const rows = await prisma.regions.findMany({
    where: {
      auto_predict_enabled: true,
      latitude: { not: null },
      longitude: { not: null },
    },
    orderBy: { name: 'asc' },
  });
  return rows.map(toResponse);
}
