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
  // Optional: comma-separated lists for alert notifications
  alertNotifyPhones: process.env.ALERT_NOTIFY_PHONES
    ? process.env.ALERT_NOTIFY_PHONES.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
  alertNotifyEmails: process.env.ALERT_NOTIFY_EMAILS
    ? process.env.ALERT_NOTIFY_EMAILS.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
};
