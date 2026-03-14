import { prisma } from '../lib/db.js';

function toResponse(row) {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    training_accuracy: row.training_accuracy ?? null,
    training_date: row.training_date ? row.training_date.toISOString().slice(0, 10) : null,
  };
}

function parseDate(v) {
  if (v == null || v === '') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function findAll() {
  const rows = await prisma.models.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toResponse);
}

export async function findById(id) {
  const row = await prisma.models.findFirst({ where: { id: BigInt(id) } });
  return toResponse(row);
}

export async function create(data) {
  const row = await prisma.models.create({
    data: {
      name: data.name ?? null,
      algorithm: data.algorithm ?? null,
      version: data.version ?? null,
      training_accuracy: data.training_accuracy ?? null,
      training_date: parseDate(data.training_date),
      artifact_path: data.artifact_path ?? null,
    },
  });
  return toResponse(row);
}

export async function update(id, data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.algorithm !== undefined) payload.algorithm = data.algorithm;
  if (data.version !== undefined) payload.version = data.version;
  if (data.training_accuracy !== undefined) payload.training_accuracy = data.training_accuracy;
  if (data.training_date !== undefined) payload.training_date = parseDate(data.training_date);
  if (data.artifact_path !== undefined) payload.artifact_path = data.artifact_path;
  const row = await prisma.models.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return toResponse(row);
}

export async function remove(id) {
  await prisma.models.delete({ where: { id: BigInt(id) } });
}
