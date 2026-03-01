import dotenv from 'dotenv';

dotenv.config();

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (url && !url.includes('${')) return url;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const host = process.env.DATABASE_HOST;
  const port = process.env.DATABASE_PORT;
  const name = process.env.DATABASE_NAME;
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
}

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: getDatabaseUrl(),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
