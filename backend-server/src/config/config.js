import dotenv from 'dotenv';

dotenv.config();

function getDatabaseUrl() {
  let url = process.env.DATABASE_URL;
  if (!url || url.includes('${')) {
    const user = process.env.DATABASE_USER;
    const password = process.env.DATABASE_PASSWORD;
    const host = process.env.DATABASE_HOST;
    const port = process.env.DATABASE_PORT;
    const name = process.env.DATABASE_NAME;
    url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
  }
  const sslMode = process.env.SSL_MODE?.trim();
  if (sslMode) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}sslmode=${encodeURIComponent(sslMode)}`;
  }
  return url;
}

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: getDatabaseUrl(),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY,
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  mlServiceUrl: process.env.ML_SERVICE_URL,
  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  defaultSmsCountryCode: process.env.DEFAULT_SMS_COUNTRY_CODE || '',
  // SMTP / Email
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER,
  /** Skip creating an automation alert for a region if one was already created in the last N ms (avoid duplicates). Set AUTOMATION_DEDUPE_MS in env (e.g. 1800000 = 30 min). */
  automationDedupeMs: Number(process.env.AUTOMATION_DEDUPE_MS) || 30 * 60 * 1000,
  /** Automation alerts: send SMS and/or email to users in region. Set AUTOMATION_ALERT_SMS and AUTOMATION_ALERT_EMAIL to yes/no (default yes). */
  automationAlertSms: (process.env.AUTOMATION_ALERT_SMS || 'yes').toLowerCase() === 'yes',
  automationAlertEmail: (process.env.AUTOMATION_ALERT_EMAIL || 'yes').toLowerCase() === 'yes',
};
