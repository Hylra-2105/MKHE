# AGENTS.md — MKHE Backend

> **AI agents MUST read and strictly follow every rule in this file before writing any code.**
> This file governs all code generation, architecture decisions, and backend tooling choices.

---

## 🏗️ Project Overview

| Field              | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Runtime**        | Node.js (ES Modules — `"type": "module"`)          |
| **Framework**      | Express.js v5                                      |
| **Database**       | MongoDB (via Mongoose v9)                          |
| **Authentication** | JWT (jsonwebtoken v9) + bcrypt v6                  |
| **Architecture**   | Modular / Layered (routes → controller → model)    |
| **Email**          | Nodemailer v8 (Gmail SMTP, lazy-loaded transporter)|
| **i18n**           | Custom file-based loader (`src/config/i18n.js`)    |
| **Dev server**     | `npm run dev` (nodemon, port 5000)                 |
| **Prod server**    | `npm start` (node server.js)                       |
| **Cookie support** | cookie-parser (installed, available if needed)     |
| **CORS**           | Whitelist: `localhost:5173`, `localhost:5174`       |

---

## 📁 Folder Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.js            ← MongoDB connection (mongoose.connect)
│   │   ├── i18n.js          ← Custom translation loader + cache + getTranslation()
│   │   └── nodemailer.js    ← Lazy-loaded Gmail SMTP transporter
│   ├── locales/             ← Email template translations
│   │   ├── en/
│   │   │   └── email.json   ← EN email strings (verification, resetPassword, blockAccount)
│   │   └── vi/
│   │       └── email.json   ← VI email strings (same structure)
│   ├── middlewares/
│   │   ├── checkRole.js     ← Role guard factory: checkRole(["Admin", "Staff"])
│   │   ├── normalizeEmail.js← Lowercases + strips Gmail dots/aliases
│   │   └── verifyToken.js   ← JWT verify + blocked-account check → sets req.user
│   ├── modules/             ← Feature-based modules (one folder per domain)
│   │   ├── auth/
│   │   │   ├── auth.controller.js  ← All auth handlers (register, login, OTP, etc.)
│   │   │   └── auth.routes.js      ← /api/auth/* routes
│   │   └── users/
│   │       ├── user.controller.js  ← getAllUsers, updateUser, deleteUser
│   │       ├── user.model.js       ← Mongoose User schema + pre-save hook + matchPassword()
│   │       └── user.routes.js      ← /api/users/* routes (all Admin-only)
│   └── utils/
│       ├── email.js         ← sendVerificationEmail(), sendPasswordResetEmail(), sendBlockAccountEmail()
│       ├── helpers.js       ← createVietnameseRegex() — accent-aware search helper
│       └── response.js      ← successResponse(), errorResponse() helpers
├── .env                     ← Environment variables (never commit)
├── package.json
└── server.js                ← App entry: dotenv → express → cors → routes → listen
```

---

## 🔴 Architecture Rules (MANDATORY)

### Rule 1 — ES Modules Only
All files use `import`/`export` (no `require`). Never mix CommonJS syntax.
```js
// ✅ CORRECT
import express from "express";
export const myFunction = () => {};

// ❌ WRONG
const express = require("express");
module.exports = { myFunction };
```

### Rule 2 — Module Structure
Every new feature domain gets its own folder under `src/modules/<name>/`:
```
modules/
  <name>/
    <name>.routes.js      ← Express Router, applies middleware, calls controller
    <name>.controller.js  ← Business logic (async/await + try/catch)
    <name>.model.js       ← Mongoose schema (if this domain owns a collection)
```
- Routes only wire middleware + controller — no logic
- Controllers contain business logic — no raw `res.json()` formatting (use `successResponse`/`errorResponse`)
- Models own schema + hooks + instance methods

### Rule 3 — Response Format (MANDATORY)
**Always** use the helpers from `src/utils/response.js`. Never write raw `res.json()` for error responses.

```js
import { successResponse, errorResponse } from "../../utils/response.js";

// ✅ SUCCESS
return successResponse(res, 200, "USER_UPDATE_SUCCESS", updatedUser);
// → { success: true, message: "USER_UPDATE_SUCCESS", data: updatedUser }

// ✅ ERROR
return errorResponse(res, 404, "USER_NOT_FOUND");
// → { success: false, message: "USER_NOT_FOUND", errors: null }
```

> ⚠️ **Known inconsistency**: `auth.controller.js` currently uses raw `res.status().json()` for most responses. When refactoring, switch to `successResponse`/`errorResponse`.

### Rule 4 — Message Codes (Not Human Strings)
API response `message` fields MUST be **uppercase snake_case codes** — never raw human text.
Frontend is responsible for translating these codes via `react-i18next`.

```js
// ✅ CORRECT
res.status(400).json({ message: "EMAIL_ALREADY_EXISTS" });

// ❌ WRONG
res.status(400).json({ message: "Email đã tồn tại rồi!" });
```

### Rule 5 — Middleware Order in Routes
Always apply middleware in this order: `normalizeEmail` → `verifyToken` → `checkRole` → controller.
```js
// ✅ CORRECT
router.put("/:id", verifyToken, checkRole(["Admin"]), updateUser);

// ❌ WRONG — checkRole before verifyToken (req.user not set yet)
router.put("/:id", checkRole(["Admin"]), verifyToken, updateUser);
```

### Rule 6 — Never Expose Sensitive Fields
When returning user data, always exclude: `password`, `otp`, `resetPasswordOtp`, `resetPasswordToken`, `refreshToken`.

```js
// ✅ Using .select()
User.find(query).select("-password -otp -refreshToken -resetPasswordOtp -resetPasswordToken")

// ✅ Or inline in controller (manual pick)
const { _id, email, name, avatar, role, isVerified } = user;
```

### Rule 7 — Environment Variables via `process.env`
All config comes from `.env`. Never hard-code secrets or URLs.
Access with `process.env.VARIABLE_NAME`. Check critical vars at startup.

### Rule 8 — Async Email (Fire and Forget)
When sending notification emails that should NOT block the API response (e.g., block notification), use `.catch()` pattern:
```js
// ✅ Non-blocking email
sendBlockAccountEmail(email, reason, lang).catch((err) => {
  console.error("[Email Error]", err.message);
});

// ❌ WRONG — blocks response
await sendBlockAccountEmail(email, reason, lang);
```

---

## 📡 API Routes Reference

### Auth — `POST /api/auth/*`

All routes are under `/api/auth`. The `normalizeEmailMiddleware` is applied on any route that accepts an `email` body field.

| Method | Path | Middleware | Handler | Description |
|--------|------|-----------|---------|-------------|
| POST | `/register` | `normalizeEmail` | `registerUser` | Create account, send OTP email |
| POST | `/verify-email` | — | `verifyEmail` | Verify OTP (6-digit), mark isVerified |
| POST | `/login` | `normalizeEmail` | `loginUser` | Local login, return JWT + user |
| POST | `/resend-otp` | `normalizeEmail` | `resendOTP` | Resend verification OTP |
| POST | `/social-login` | `normalizeEmail` | `socialLogin` | Google OAuth login/register |
| POST | `/forgot-password` | `normalizeEmail` | `forgotPassword` | Send reset OTP (local accounts only) |
| POST | `/verify-reset-otp` | — | `verifyResetOtp` | Verify reset OTP → return resetToken |
| POST | `/reset-password` | `normalizeEmail` | `resetPassword` | Use resetToken to set new password |
| POST | `/logout` | `verifyToken` | `logoutUser` | Clear refreshToken in DB |

### Users — `GET|PUT|DELETE /api/users/*`

All routes require `verifyToken` + `checkRole(["Admin"])`.

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | `getAllUsers` | Paginated list with search + role filter |
| PUT | `/:id` | `updateUser` | Update user fields (block/unblock, profile) |
| DELETE | `/:id` | `deleteUser` | Hard-delete user by ID |

#### `GET /api/users` Query Params
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 5 | Items per page |
| `search` | string | `""` | Name/email/phone search (Vietnamese accent-aware) |
| `role` | string | `""` | Filter by role (`Customer`, `Staff`, `Admin`, `Guest`) |

---

## 🗃️ User Model — Field Reference

**Collection**: `users` | **File**: `src/modules/users/user.model.js`

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `email` | String | required | Unique, lowercase, trimmed |
| `password` | String | — | Required if `provider === "local"`. Hashed via `pre("save")` hook |
| `name` | String | `""` | Display name |
| `avatar` | String | `""` | URL to avatar image |
| `provider` | String | `"local"` | `"local"` or `"google"` |
| `role` | String | `"Customer"` | Enum: `Guest`, `Customer`, `Staff`, `Admin` |
| `phone` | String | `""` | Phone number (stored without dial code prefix) |
| `country` | String | `""` | Country name |
| `city` | String | `""` | City / province name |
| `address` | String | `""` | Street address |
| `bio` | String | `""` | User bio |
| `language` | String | `"vi"` | `"en"` or `"vi"` — used for email templates |
| `isVerified` | Boolean | `false` | Must be `true` to login |
| `isBlocked` | Boolean | `false` | Blocked accounts get 403 on every request |
| `blockReason` | String | — | Human-readable block reason |
| `otp` | String | `null` | Email verification OTP (6 digits, 15 min TTL) |
| `otpExpires` | Date | `null` | OTP expiry timestamp |
| `resetPasswordOtp` | String | `null` | Password reset OTP |
| `resetPasswordToken` | String | `null` | Temp token after OTP verified (for reset step) |
| `resetPasswordExpires` | Date | `null` | Reset session expiry |
| `refreshToken` | String | `null` | Reserved (cleared on logout) |
| `createdAt` | Date | auto | Mongoose timestamps |
| `updatedAt` | Date | auto | Mongoose timestamps |

**Instance method**: `user.matchPassword(plainPassword)` → `Promise<boolean>` — uses bcrypt.compare

---

## 🔐 Middleware Reference

### `verifyToken`
- Reads `Authorization: Bearer <token>` header
- Verifies JWT with `process.env.JWT_SECRET`
- Fetches user from DB to check `isBlocked` (real-time block check)
- Sets `req.user = { id, email, role }` (decoded JWT payload)
- Errors: `MISSING_TOKEN` (401), `USER_NOT_FOUND` (404), `ACCOUNT_BLOCKED` (403), `TOKEN_EXPIRED` (401), `INVALID_TOKEN` (403)

### `checkRole(allowedRoles[])`
- Factory function — returns middleware
- Checks `req.user.role` is in `allowedRoles`
- Error: `FORBIDDEN_ACCESS` (403)
- Must run **after** `verifyToken`

### `normalizeEmailMiddleware`
- Lowercases + trims email
- For Gmail: removes all dots in local part, strips `+alias` suffixes
- Prevents duplicate accounts via Gmail tricks (e.g. `user.name+tag@gmail.com` → `username@gmail.com`)

---

## 📧 Email System

**File**: `src/utils/email.js`

| Function | Trigger | Template key |
|----------|---------|--------------|
| `sendVerificationEmail(email, otp, lang)` | After register / resendOTP | `email.json → verification` |
| `sendPasswordResetEmail(email, otp, lang)` | After forgotPassword | `email.json → resetPassword` |
| `sendBlockAccountEmail(email, reason, lang)` | After updateUser blocks account | `email.json → blockAccount` |

**Translation loader** (`src/config/i18n.js`):
- `loadTranslation(lang, namespace)` — reads `src/locales/<lang>/<namespace>.json`, caches in memory
- `getTranslation(translations, "dot.notation.path", { replacements })` — supports `{variable}` placeholders
- Falls back to `"vi"` if `lang` file not found

**Transporter** (`src/config/nodemailer.js`):
- Gmail SMTP, lazy-loaded singleton via `getTransporter()`
- Credentials: `process.env.EMAIL_USER` + `process.env.EMAIL_PASS`

---

## 🛠️ Utilities Reference

### `src/utils/response.js`
```js
successResponse(res, statusCode, message, data = null)
// → { success: true, message, data }

errorResponse(res, statusCode, message, errors = null)
// → { success: false, message, errors }
```

### `src/utils/helpers.js`
```js
createVietnameseRegex(keyword)
// Converts accented input to a regex that matches all tone variants
// Used in getAllUsers for accent-insensitive search across name/email/phone
// e.g. "nguyen" matches "Nguyễn", "nguyên", etc.
```

---

## 🌐 CORS & Headers

Configured in `server.js`:
- **Allowed origins**: `http://localhost:5173`, `http://localhost:5174`
- **Credentials**: `true`
- **Methods**: `GET`, `POST`, `PUT`, `DELETE`
- **Allowed headers**: `Content-Type`, `Authorization`
- **COOP/COEP headers** (required for Firebase Google OAuth popup):
  - `Cross-Origin-Opener-Policy: same-origin-allow-popups`
  - `Cross-Origin-Embedder-Policy: unsafe-none`

When deploying to production, update the CORS `origin` array to include the real frontend domain.

---

## ⚠️ Known Issues / Tech Debt

### 1. `auth.controller.js` — Raw `res.json()` instead of helpers
Most handlers in `auth.controller.js` use `res.status().json()` directly instead of `successResponse`/`errorResponse`. When refactoring, migrate to the helpers for consistency.

### 2. `logoutUser` — Uses `errorResponse` without import
`auth.controller.js` calls `errorResponse(res, 500, "SERVER_ERROR")` in `logoutUser` but doesn't import it. Fix: add `import { errorResponse } from "../../utils/response.js"`.

### 3. `resendOTP` — Wrong function signature
`sendVerificationEmail` is called with 4 args (`email, otp, EMAIL_USER, EMAIL_PASS`) but the function only accepts 3 (`email, otp, lang`). Should be: `sendVerificationEmail(user.email, otp, user.language || "vi")`.

### 4. No Model for Auth
The `auth` module has no `auth.model.js` — it reuses `user.model.js` from the `users` module via cross-module import. This is acceptable for now since users and auth share the same collection.

### 5. No Input Validation Library
Currently all input validation is manual (`if (!field) return 400`). Consider adding `express-validator` or `zod` for scalable validation.

---

## 📌 Environment Variables

Defined in `.env` — **never commit this file**.

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string (MongoDB Atlas or local) |
| `JWT_SECRET` | Secret key for signing/verifying JWTs |
| `EMAIL_USER` | Gmail address used as SMTP sender |
| `EMAIL_PASS` | Gmail App Password (not the account password) |

---

## 🚀 Common Commands

```bash
npm run dev    # Start with nodemon (auto-restart on file change)
npm start      # Start with node (production)
```

---

## ✅ Before Writing Code — Checklist

1. [ ] Use `import`/`export` — no `require()`
2. [ ] New feature? Create `src/modules/<name>/` with routes + controller + model
3. [ ] Return responses with `successResponse` / `errorResponse` from `utils/response.js`
4. [ ] Message codes are UPPERCASE_SNAKE_CASE strings — no raw human text
5. [ ] Apply middlewares in correct order: `normalizeEmail` → `verifyToken` → `checkRole` → controller
6. [ ] Never return `password`, `otp`, `resetPasswordToken`, `refreshToken` in any response
7. [ ] Read `KNOWN ISSUES` section above before touching `auth.controller.js`
8. [ ] Emails that don't block the response must use `.catch()` fire-and-forget pattern
9. [ ] All secrets come from `process.env.*` — never hard-code

---

## 🔌 Adding a New Module — Checklist

```
1. Create src/modules/<name>/
   ├── <name>.routes.js
   ├── <name>.controller.js
   └── <name>.model.js        (if new collection needed)

2. Register in server.js:
   import <name>Routes from "./src/modules/<name>/<name>.routes.js";
   app.use("/api/<name>", <name>Routes);

3. Apply standard middleware chain in routes:
   router.get("/", verifyToken, checkRole(["Admin"]), getAll<Name>);

4. Add any new env vars to .env + document in AGENTS.md
```
