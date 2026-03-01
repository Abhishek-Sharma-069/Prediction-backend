// TODO: inject prisma or DB client
export const findAll = async () => [];
export const findById = async (id) => null;
export const create = async (data) => data;
export const update = async (id, data) => ({ id, ...data });
export const remove = async (id) => {};
