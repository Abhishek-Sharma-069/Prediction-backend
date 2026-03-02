import { prisma } from '../lib/db.js';

function toResponse(row) {
  if (!row) return null;
  return {
    ...row,
    id: String(row.id),
    region_id: row.region_id != null ? String(row.region_id) : null,
    disaster_type_id: row.disaster_type_id != null ? String(row.disaster_type_id) : null,
    model_id: row.model_id != null ? String(row.model_id) : null,
  };
}

export async function findAll() {
  const rows = await prisma.predictions.findMany({ orderBy: { id: 'asc' } });
  return rows.map(toResponse);
}

export async function findById(id) {
  const row = await prisma.predictions.findFirst({ where: { id: BigInt(id) } });
  return toResponse(row);
}

export async function create(data) {
  const row = await prisma.predictions.create({
    data: {
      region_id: data.region_id != null ? BigInt(data.region_id) : null,
      disaster_type_id: data.disaster_type_id != null ? BigInt(data.disaster_type_id) : null,
      model_id: data.model_id != null ? BigInt(data.model_id) : null,
      predicted_probability: data.predicted_probability ?? null,
      predicted_severity: data.predicted_severity ?? null,
      risk_score: data.risk_score ?? null,
      generated_at: data.generated_at ?? null,
      input_snapshot: data.input_snapshot ?? null,
    },
  });
  return toResponse(row);
}
