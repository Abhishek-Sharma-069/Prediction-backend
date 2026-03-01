import { defineConfig } from 'prisma/config';
import config from './config.js';

export default defineConfig({
  schema: '../../prisma/schema.prisma',
  migrations: {
    path: '../../prisma/migrations',
  },
  datasource: {
    url: config.databaseUrl,
  },
});
