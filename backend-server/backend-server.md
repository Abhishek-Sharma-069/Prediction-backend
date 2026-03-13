# Backend Server — Flow & Overview

This document explains how the Prediction backend works so everyone can follow the flow.

---

## 1. High-level request flow

Every API request goes through this pipeline:

```
  Client request
       ↓
  CORS + express.json() + cookieParser()
       ↓
  requestLogger (middleware)
       ↓
  /api/* routes (see section 2)
       ↓
  Controller → Service → DB / external (Twilio, SMTP)
       ↓
  Response (JSON) or errorHandler
```

- **Routes** define URLs and map them to **controllers**.
- **Controllers** parse the request and call **services**.
- **Services** contain business logic, use **Prisma** for the database, and may call **SMS** or **email** services.

---

## 2. API structure

Base path: **`/api`**

| Mount       | Purpose                    |
|------------|----------------------------|
| `/api/auth`     | Register, send OTP, login   |
| `/api/users`   | User CRUD (typically protected) |
| `/api/sensors` | Sensor data                 |
| `/api/predictions` | Predictions              |
| `/api/alerts`   | Alerts CRUD + notifications |
| `/api/ml`      | ML service integration     |

- **Health:** `GET /health` → `{ status: 'ok' }`
- **API docs (dev only):** `GET /api-docs` → Swagger UI

---

## 3. Auth flow

### 3.1 Register

```
POST /api/auth/register
Body: { name?, email?, mobile?, password }  (at least one of email or mobile)
  → Service: create user, hash password, save to DB
  → Response: 201 + user (no token)
```

### 3.2 Send OTP (and how it’s delivered)

```
POST /api/auth/send-otp
Body: { email } OR { mobile }  (exactly one)
  → Service: find user by email or mobile
  → Generate 6-digit OTP, save on user row
  → Deliver OTP (production only):
       • If identifier is EMAIL → send via email (SMTP)
       • If identifier is MOBILE → send via Twilio SMS
  → Response: { message: 'OTP sent', otp? }
```

| Environment  | Where the OTP goes |
|--------------|--------------------|
| **Development** | OTP is **returned in the API response** (`otp`). No real Twilio SMS or email is sent (only console logs). |
| **Production**  | OTP is **sent via Twilio SMS** (mobile) or **email** (email). OTP is **not** included in the API response. |

### 3.3 Login

```
POST /api/auth/login
Body: { email | mobile } + { password | otp }  (one identifier, one credential)
  → If password: verify hash → sign JWT
  → If OTP: verify OTP from DB, clear it, then sign JWT
  → Response: set cookie + JSON { token, user }
```

---

## 4. OTP delivery flow (SMS & Email)

```
                    sendOtp(identifier)
                            │
              ┌─────────────┴─────────────┐
              │                           │
         identifier is                identifier is
            email                       mobile
              │                           │
              ▼                           ▼
    email.service.sendEmail()    sms.service.sendSms()
    (Nodemailer / SMTP)          (Twilio)
              │                           │
    ┌─────────┴─────────┐       ┌─────────┴─────────┐
    │ Development:      │       │ Development:      │
    │ no real send;     │       │ no real send;     │
    │ OTP in response   │       │ OTP in response   │
    └──────────────────┘       └──────────────────┘
    ┌─────────┴─────────┐       ┌─────────┴─────────┐
    │ Production:       │       │ Production:       │
    │ real email send;  │       │ real Twilio SMS;  │
    │ OTP not in resp   │       │ OTP not in resp   │
    └──────────────────┘       └──────────────────┘
```

- **SMS:** `src/services/sms.service.js` — Twilio; numbers normalized to E.164 (optional `DEFAULT_SMS_COUNTRY_CODE`).
- **Email:** `src/services/email.service.js` — Nodemailer SMTP.

---

## 5. Alert flow (create → notify)

When an alert is **created**:

```
POST /api/alerts
Body: { region_id?, prediction_id?, alert_level_id?, message?, issued_at?, expires_at?, status? }
  → Service: prisma.alerts.create(...)
  → Then: notifyAlert(alert)
```

**notifyAlert(alert):**

- **Development:** Only **console.log**: alert id, message, and “would notify” phones/emails (no real send).
- **Production:** Sends SMS to every number in `ALERT_NOTIFY_PHONES` and email to every address in `ALERT_NOTIFY_EMAILS` (from config). Failures are logged per recipient; alert creation still succeeds.

So: **Create alert → save to DB → optionally notify by SMS/email** (depending on env and config).

---

## 6. Environment & config

Config is in **`src/config/config.js`**, driven by **`.env`**.

| Area   | Key (examples) | Purpose |
|--------|----------------|---------|
| App    | `PORT`, `NODE_ENV` | Server port; dev vs prod behaviour (e.g. OTP in response, console logs only for SMS/email). |
| DB     | `DATABASE_URL` or `DATABASE_*` | PostgreSQL connection. |
| Auth   | `JWT_SECRET`, `JWT_EXPIRY` | Token signing. |
| Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | SMS sending. |
| SMS    | `DEFAULT_SMS_COUNTRY_CODE` (optional) | e.g. `91` so `9876543210` → `+919876543210`. |
| SMTP   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Email sending. |
| Alerts | `ALERT_NOTIFY_PHONES`, `ALERT_NOTIFY_EMAILS` (optional) | Comma-separated; used when an alert is created in production. |

In **dev**, SMS and email are not actually sent; behaviour is “console log or return in response as needed”.

---

## 7. Project structure (relevant parts)

```
backend-server/
├── server.js                 # Express app, DB connect, mount /api, error handler
├── src/
│   ├── config/
│   │   └── config.js         # All env-based config (DB, JWT, Twilio, SMTP, alerts)
│   ├── lib/
│   │   └── db.js             # Prisma client
│   ├── routes/
│   │   ├── index.js          # Mounts /auth, /users, /sensors, /predictions, /alerts, /ml
│   │   ├── auth.routes.js
│   │   ├── alert.routes.js
│   │   └── ...
│   ├── controllers/          # HTTP layer: req/res, call services
│   ├── services/             # Business logic
│   │   ├── auth.service.js   # register, sendOtp, loginWithPassword, loginWithOtp
│   │   ├── alert.service.js  # CRUD + notifyAlert on create
│   │   ├── sms.service.js    # sendSms (Twilio)
│   │   ├── email.service.js  # sendEmail (Nodemailer)
│   │   └── ...
│   ├── middlewares/          # requestLogger, errorHandler, auth, etc.
│   └── utils/                # e.g. otp.util.js (generateOtp, verifyOtp)
└── prisma/
    └── schema.prisma         # Data models
```

---

## 8. Quick reference

- **Auth:** Register → (optional) Send OTP → Login with password or OTP.
- **OTP (send-otp API):**  
  - **Development:** OTP is returned in the response; no real Twilio SMS or email.  
  - **Production:** OTP is sent via Twilio SMS (mobile) or email; OTP is not in the response.
- **Alerts:** Create via API → saved to DB → in production, SMS/email sent to configured lists; in dev, only logged.
- **Config:** All behaviour (DB, JWT, Twilio, SMTP, alert recipients) comes from `config.js` / `.env`.

For detailed request/response shapes, use **`GET /api-docs`** in development.
