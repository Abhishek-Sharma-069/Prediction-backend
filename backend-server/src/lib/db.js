import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import config from '../config/config.js';

const { PrismaClient } = pkg;

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});
export const prisma = new PrismaClient({ adapter });
