import bcrypt from 'bcrypt';
import { prisma } from '../lib/db.js';

function toResponse(row) {
  if (!row) return null;
  const out = { ...row, id: String(row.id), region_id: row.region_id != null ? String(row.region_id) : null };
  delete out.password_hash;
  return out;
}

export async function findAll() {
  const rows = await prisma.users.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toResponse);
}

export async function findById(id) {
  const row = await prisma.users.findFirst({ where: { id: BigInt(id) } });
  return toResponse(row);
}

export async function create(data) {
  let password_hash = data.password_hash ?? null;
  if (data.password) password_hash = await bcrypt.hash(data.password, 10);
  const row = await prisma.users.create({
    data: {
      name: data.name ?? null,
      email: data.email ?? null,
      mobile: data.mobile ?? null,
      password_hash,
      otp: data.otp ?? null,
      region_id: data.region_id != null ? BigInt(data.region_id) : null,
      status: data.status ?? null,
    },
  });
  return toResponse(row);
}

export async function update(id, data) {
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.mobile !== undefined) payload.mobile = data.mobile;
  if (data.password !== undefined) payload.password_hash = await bcrypt.hash(data.password, 10);
  else if (data.password_hash !== undefined) payload.password_hash = data.password_hash;
  if (data.otp !== undefined) payload.otp = data.otp;
  if (data.region_id !== undefined) payload.region_id = data.region_id == null ? null : BigInt(data.region_id);
  if (data.status !== undefined) payload.status = data.status;
  const row = await prisma.users.update({
    where: { id: BigInt(id) },
    data: payload,
  });
  return toResponse(row);
}

export async function remove(id) {
  await prisma.users.delete({ where: { id: BigInt(id) } });
}
