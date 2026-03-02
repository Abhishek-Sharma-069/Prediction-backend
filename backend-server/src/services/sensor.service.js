import { prisma } from '../lib/db.js';

function toResponse(row) {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    sensor_type_id: row.sensor_type_id != null ? String(row.sensor_type_id) : null,
    region_id: row.region_id != null ? String(row.region_id) : null,
  };
}

export async function findAll() {
  const rows = await prisma.sensors.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toResponse);
}

export async function findById(id) {
  const row = await prisma.sensors.findFirst({ where: { id: BigInt(id) } });
  return toResponse(row);
}

export async function create(data) {
  const row = await prisma.sensors.create({
    data: {
      sensor_code: data.sensor_code ?? null,
      sensor_type_id: data.sensor_type_id != null ? BigInt(data.sensor_type_id) : null,
      region_id: data.region_id != null ? BigInt(data.region_id) : null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      installation_date: data.installation_date ?? null,
      status: data.status ?? null,
      last_maintenance: data.last_maintenance ?? null,
    },
  });
  return toResponse(row);
}

export async function update(id, data) {
  const payload = {};
  if (data.sensor_code !== undefined) payload.sensor_code = data.sensor_code;
  if (data.sensor_type_id !== undefined) payload.sensor_type_id = data.sensor_type_id == null ? null : BigInt(data.sensor_type_id);
  if (data.region_id !== undefined) payload.region_id = data.region_id == null ? null : BigInt(data.region_id);
  if (data.latitude !== undefined) payload.latitude = data.latitude;
  if (data.longitude !== undefined) payload.longitude = data.longitude;
  if (data.installation_date !== undefined) payload.installation_date = data.installation_date;
  if (data.status !== undefined) payload.status = data.status;
  if (data.last_maintenance !== undefined) payload.last_maintenance = data.last_maintenance;
  const row = await prisma.sensors.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return toResponse(row);
}

export async function remove(id) {
  await prisma.sensors.delete({ where: { id: BigInt(id) } });
}
