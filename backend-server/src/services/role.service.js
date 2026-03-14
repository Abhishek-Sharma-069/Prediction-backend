import { prisma } from '../lib/db.js';

function toResponse(row) {
  if (!row) return null;
  return { ...row, id: String(row.id) };
}

export async function findAll() {
  const rows = await prisma.roles.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toResponse);
}

export async function findById(id) {
  const row = await prisma.roles.findFirst({ where: { id: BigInt(id) } });
  return toResponse(row);
}

export async function create(data) {
  const row = await prisma.roles.create({
    data: {
      role_name: data.role_name ?? null,
      description: data.description ?? null,
    },
  });
  return toResponse(row);
}

export async function update(id, data) {
  const payload = {};
  if (data.role_name !== undefined) payload.role_name = data.role_name;
  if (data.description !== undefined) payload.description = data.description;
  const row = await prisma.roles.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return toResponse(row);
}

export async function remove(id) {
  await prisma.roles.delete({ where: { id: BigInt(id) } });
}
