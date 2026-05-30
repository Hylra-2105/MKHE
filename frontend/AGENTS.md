# AGENTS.md — MKHE Frontend

> **AI agents MUST read and strictly follow every rule in this file before writing any code.**
> This file governs all code generation, architecture decisions, and tooling choices for this project.

---

## 🏗️ Project Overview

| Field | Value |
|-------|-------|
| **Framework** | React 19 + Vite 8 |
| **Language** | JavaScript (JSX) |
| **Styling** | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| **State** | Zustand v5 |
| **Routing** | React Router DOM v7 |
| **HTTP Client** | Axios (via `src/api/axiosClient.js`) |
| **Auth** | Firebase + JWT (token stored in `localStorage` + Zustand) |
| **i18n** | i18next + react-i18next + i18next-browser-languagedetector |
| **Notifications** | react-hot-toast |
| **Icons** | lucide-react (+ custom SVG in `components/ui/icons/`) |
| **Path alias** | `@` → `src/` (configured in `vite.config.js` + `jsconfig.json`) |
| **Dev server** | `npm run dev` — auto-opens browser, proxies `/api/*` to backend |
| **Linting** | ESLint 10 + eslint-plugin-react-hooks + eslint-plugin-react-refresh |
| **Git hooks** | Husky |

---

## 📁 Folder Structure

```
frontend/
├── .agents/skills/              ← Vercel Agent Skills (read before coding)
│   ├── deploy-to-vercel/
│   ├── vercel-cli-with-tokens/
│   ├── vercel-composition-patterns/
│   ├── vercel-optimize/
│   ├── vercel-react-best-practices/
│   ├── vercel-react-view-transitions/
│   └── web-design-guidelines/
├── .husky/                      ← Git hook scripts
├── src/
│   ├── api/                     ← HTTP layer (axiosClient + *Api.js files)
│   │   ├── axiosClient.js       ← Single Axios instance (interceptors here)
│   │   ├── authApi.js           ← Auth HTTP calls
│   │   └── userApi.js           ← User HTTP calls ⚠️ (see Known Issues)
│   ├── assets/                  ← Static assets (images, fonts, svgs)
│   ├── components/
│   │   ├── layout/              ← App-wide layouts
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── AuthHeader.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── Header.jsx
│   │   ├── router/              ← Route guards
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AuthRoute.jsx
│   │   └── ui/                  ← Shared reusable primitives (no business logic)
│   │       ├── Button.jsx
│   │       ├── ErrorText.jsx
│   │       ├── InputField.jsx
│   │       ├── Pagination.jsx
│   │       └── icons/
│   │           └── GoogleIcon.jsx
│   ├── config/
│   │   └── firebase.js          ← Firebase app initialization
│   ├── constants/
│   │   └── endpoints.js         ← API endpoint constants (AUTH.REGISTER, AUTH.LOGIN, etc.)
│   ├── features/                ← ALL business logic lives here (colocated)
│   │   ├── auth/
│   │   │   └── components/      ← LoginForm, RegisterForm, ForgotPasswordForm, etc.
│   │   └── users/
│   │       └── components/      ← UserTable, UserFilter, UserDetailModal, etc.
│   ├── hooks/                   ← Shared hooks only (not feature-specific)
│   │   └── useLocations.js      ← Fetches countries/states from countriesnow API
│   ├── i18n.js                  ← i18next configuration
│   ├── locales/                 ← Translation files
│   │   ├── en/                  ← English (admin, common, errors, forgot_password,
│   │   │                           header, login, otp, register)
│   │   └── vi/                  ← Vietnamese (same namespaces)
│   ├── pages/                   ← Thin page components (routing only)
│   │   ├── auth/                ← LoginPage, RegisterPage, VerifyOTPPage,
│   │   │                           ForgotPasswordPage, ResetPasswordPage
│   │   ├── errors/              ← ForbiddenPage
│   │   ├── home/                ← HomePage
│   │   └── users/               ← UserManagementPage
│   ├── stores/
│   │   └── useAuthStore.js      ← Zustand auth store (user, token, actions)
│   ├── utils/
│   │   ├── validators.js        ← Form validation helpers + phone number utils
│   │   └── theme.js             ← Dark/light mode CSS variable management
│   ├── App.css                  ← App-level styles (minimally used)
│   ├── App.jsx                  ← Root routing setup
│   ├── index.css                ← Global styles + Tailwind + CSS variables
│   └── main.jsx                 ← React app entry point
├── AGENTS.md                    ← THIS FILE
├── eslint.config.js
├── index.html
├── jsconfig.json                ← Path alias for IDE support (@→src/)
├── package.json
├── skills-lock.json             ← Vercel agent skills version lock
└── vite.config.js
```

---

## ⚠️ Known Issues / Tech Debt

> **Read this before writing or refactoring any code.**
> These are existing violations of the architecture rules that have NOT been fixed yet.

### 1. `userApi.js` — Multiple Violations (Rule 3 + Rule 4)
**File**: `src/api/userApi.js`
- Uses raw `axios` instead of `axiosClient` → **must be changed to use `axiosClient`**
- Hard-codes `http://localhost:5000/api/users` instead of using the proxy or `ENDPOINTS` constant
- Imports `useAuthStore` directly inside an API file → breaks separation of concerns
- **Fix target**: Rewrite to use `axiosClient` (which already handles auth tokens via interceptors) and use `ENDPOINTS` constants

### 2. `useAuthStore.js` — Calls API Directly (Rule 4)
**File**: `src/stores/useAuthStore.js`
- Calls `authApi.*` methods directly inside the store actions
- Per Rule 4: stores should call *services*, not API files directly
- **Fix target**: Extract a `auth.service.js` inside `features/auth/` that wraps `authApi` and handles data transformation

### 3. `UserManagementPage.jsx` — Business Logic in Page (Rule 2)
**File**: `src/pages/users/UserManagementPage.jsx`
- Contains `useState`, `useEffect`, `fetchUsers`, pagination logic, and event handlers
- Per Rule 2: pages must be thin — only render feature components
- **Fix target**: Extract all logic into a `UserManagement` feature component inside `features/users/components/`

### 4. `authApi.js` in `src/api/` (Rule 3 — Gray Area)
**File**: `src/api/authApi.js`
- Per Rule 3, feature-specific API calls should live in `features/<name>/<name>.service.js`
- Currently `authApi.js` and `userApi.js` live in `src/api/` (shared API layer)
- **Convention adopted for this project**: Keep `*Api.js` files in `src/api/` as a shared HTTP layer, but add `features/<name>/<name>.service.js` files on top for data transformation and orchestration

---

## 🔴 Architecture Rules (MANDATORY)

### Rule 1 — Feature-Based Colocation
All business logic for a feature lives inside `src/features/<feature-name>/`. Never scatter feature code across global folders.

**Correct feature structure:**
```
features/
  auth/
    components/             ← Feature-specific UI subcomponents
    useAuth.js              ← Feature-specific hook
    auth.service.js         ← Data transformation + API orchestration
    auth.types.js           ← Feature-specific types/shapes (JSDoc)
    auth.constants.js       ← Feature-specific constants
  users/
    components/             ← UserTable, UserFilter, UserDetailModal, etc.
    users.service.js        ← User data transformation + API orchestration
```

### Rule 2 — Pages Are Thin
`src/pages/` files MUST only: import feature components, fetch top-level data, and render. **No business logic in pages.**

```jsx
// ✅ CORRECT — thin page
import UserManagementFeature from "@/features/users/components/UserManagement";
export default function UserManagementPage() {
  return <UserManagementFeature />;
}

// ❌ WRONG — business logic in page
export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => { fetchUsers().then(setUsers); }, []);
  return <table>...</table>;
}
```

### Rule 3 — API Layer (`src/api/`)
- `axiosClient.js` is the **single Axios instance** — always import from here, never import raw `axios`
- `axiosClient` already handles: attaching Bearer token, redirecting on 401/403 for non-auth pages
- `*Api.js` files in `src/api/` are the HTTP-only layer — no data transformation, no business logic
- Use `ENDPOINTS` constants from `src/constants/endpoints.js` for all API URLs
- Add `features/<name>/<name>.service.js` for orchestration/transformation on top of API files

```js
// ✅ CORRECT — axiosClient + ENDPOINTS
import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";
const response = await axiosClient.post(ENDPOINTS.AUTH.LOGIN, credentials);

// ❌ WRONG — raw axios + hardcoded URL
import axios from "axios";
const response = await axios.get("http://localhost:5000/api/users");
```

### Rule 4 — State Management (Zustand)
- Stores live in `src/stores/` (e.g., `useAuthStore.js`)
- Each store handles ONE concern (auth, ui, etc.)
- Do NOT put API calls directly in stores — call services, store results
- Access store state outside React components with `useAuthStore.getState()`

### Rule 5 — Shared vs Feature Code

| Type | Where it goes |
|------|--------------|
| Feature component | `features/<name>/components/` |
| Shared UI primitive (Button, Input, Modal) | `components/ui/` |
| Feature hook (`useAuth`) | `features/<name>/` |
| Shared hook (`useLocations`, `useDebounce`) | `hooks/` |
| Feature constants | `features/<name>/<name>.constants.js` |
| App-wide API endpoint constants | `constants/endpoints.js` |
| App-wide constants | `constants/` |
| Feature types/shapes | `features/<name>/<name>.types.js` (JSDoc) |
| Global types | (use JSDoc in JS project) |
| Theme utilities | `utils/theme.js` |
| Form/data validators | `utils/validators.js` |

### Rule 6 — Cross-Feature Imports Are FORBIDDEN
Features MUST NOT import from other features directly.
```js
// ❌ NEVER do this
import { useAuth } from "@/features/auth/useAuth";  // inside features/users/
```
Use Zustand stores or shared `hooks/` to share state across features.

### Rule 7 — File Size Limit
Component files must stay **< 300 lines**. Extract subcomponents or hooks when approaching the limit.

> ⚠️ `UserDetailModal.jsx` currently exceeds this limit (~28KB). Refactor when touching this file.

### Rule 8 — No Barrel Files
Avoid `index.js` that re-exports everything from a feature folder. Import directly from the specific file.

---

## 🎨 Styling Rules

- **Tailwind CSS v4** is used (configured via `@tailwindcss/vite` plugin — no `tailwind.config.js` needed)
- Use Tailwind utility classes directly in JSX — no separate CSS modules for components
- Global styles, Tailwind imports, and CSS variables go in `src/index.css`
- Component-level `*.css` files are discouraged; prefer Tailwind
- **Do NOT use inline `style={}` props** unless for truly dynamic computed values (e.g., progress bar width)

### Custom CSS Variables (Theme)
The project uses CSS custom properties for dark/light mode, managed in `src/utils/theme.js`:

| Variable | Light | Dark |
|----------|-------|------|
| `--color-mkhe-bg` | `#f5f0ea` | `#1a0f0a` |
| `--color-mkhe-text` | `#2d1e12` | `#d9c5b2` |
| `--color-mkhe-input` | `#e4d5c7` | `#2a1c14` |
| `--color-mkhe-border` | `#c8b6a6` | `#4a3525` |

Use these via Tailwind's arbitrary-value syntax: `bg-[var(--color-mkhe-bg)]` or the project's pre-mapped Tailwind classes (e.g., `bg-mkhe-bg`, `text-mkhe-text`).

Theme is initialized in `main.jsx` via `initializeTheme()` and toggled via `applyTheme(isDark)`.

---

## 🔗 Path Aliases

Always use the `@` alias for imports (configured in both `vite.config.js` and `jsconfig.json`):
```js
// ✅ CORRECT
import axiosClient from "@/api/axiosClient";
import Button from "@/components/ui/Button";
import { ENDPOINTS } from "@/constants/endpoints";

// ❌ WRONG
import axiosClient from "../../api/axiosClient";
```

---

## 🌐 Routing & Auth

- **React Router DOM v7** — use `<Routes>` / `<Route>` pattern (already set up in `App.jsx`)
- `ProtectedRoute` — wraps routes that require authentication + role check (`allowedRoles`)
- `AuthRoute` — redirects already-authenticated users away from login/register pages
- Auth state is managed by Zustand `useAuthStore` in `src/stores/useAuthStore.js`
- Token is stored in both `localStorage` and Zustand state (rehydrated on page load)

### Existing Routes

| Path | Component | Guard |
|------|-----------|-------|
| `/` | → redirects to `/home` | None |
| `/home` | `HomePage` | None (MainLayout) |
| `/admin/users` | `UserManagementPage` | `ProtectedRoute allowedRoles={["Admin"]}` |
| `/login` | `LoginPage` | `AuthRoute` (redirect if logged in) |
| `/register` | `RegisterPage` | `AuthRoute` |
| `/verify-otp` | `VerifyOTPPage` | `AuthRoute` |
| `/forgot-password` | `ForgotPasswordPage` | `AuthRoute` |
| `/reset-password` | `ResetPasswordPage` | `AuthRoute` |
| `/403` | `ForbiddenPage` | None |

### Adding a New Protected Route
```jsx
// In App.jsx
<Route
  path="/admin/new-page"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

---

## 🌍 Internationalization (i18n)

- Configured in `src/i18n.js` with `i18next` + `i18next-browser-languagedetector`
- Supported languages: **Vietnamese (`vi`)** and **English (`en`)**
- Translation files live in `src/locales/<lang>/`
- Always use `useTranslation` hook with the correct **namespace** — never hardcode user-facing strings

### Translation Namespaces

| Namespace | File | Used in |
|-----------|------|---------|
| `admin` | `locales/<lang>/admin.json` | UserManagementPage, admin features |
| `common` | `locales/<lang>/common.json` | Shared strings |
| `errors` | `locales/<lang>/errors.json` | Error messages |
| `forgot_password` | `locales/<lang>/forgot_password.json` | ForgotPasswordForm, ResetPasswordForm |
| `header` | `locales/<lang>/header.json` | Header component |
| `login` | `locales/<lang>/login.json` | LoginForm |
| `otp` | `locales/<lang>/otp.json` | VerifyOTPForm |
| `register` | `locales/<lang>/register.json` | RegisterForm |

```jsx
// ✅ CORRECT — specify namespace
import { useTranslation } from "react-i18next";
const { t } = useTranslation("login");
return <p>{t("title")}</p>;

// For admin namespace
const { t } = useTranslation("admin");
return <h1>{t("users.title")}</h1>;

// ❌ WRONG — no namespace or hardcoded string
const { t } = useTranslation();  // defaults to "translation" namespace
return <p>Đăng nhập</p>;
```

---

## 📡 HTTP / API Conventions

- **Axios instance**: `src/api/axiosClient.js` — has interceptors for auth tokens and error handling
  - Request interceptor: attaches `Authorization: Bearer <token>` from `localStorage`
  - Response interceptor: on 401/403 outside auth pages → clears storage + redirects to `/login`
- **API files**: named `<feature>Api.js` (e.g., `authApi.js`, `userApi.js`) inside `src/api/`
- **Endpoints**: always use constants from `src/constants/endpoints.js`
- **Services**: feature-level data transformation + API orchestration in `features/<name>/<name>.service.js`
- **Proxy**: `/api/*` requests in dev are proxied to `VITE_API_BASE_URL` (defaults to `http://localhost:5000/api`)
- **CORS headers** set on dev server (in `vite.config.js`):
  - `Cross-Origin-Opener-Policy: same-origin-allow-popups` (required for Firebase Google popup)
  - `Cross-Origin-Embedder-Policy: unsafe-none`

### Adding a New API Endpoint
1. Add the URL to `src/constants/endpoints.js`
2. Add the method to the relevant `src/api/*Api.js` file using `axiosClient`
3. (Optional) Add a service in `features/<name>/<name>.service.js` for transformation

```js
// src/constants/endpoints.js
export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    // Add new endpoints here
  },
  USERS: {
    GET_ALL: "/users",
  }
};

// src/api/userApi.js
import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/constants/endpoints";

export const getAllUsersApi = async (page, limit, search, role) => {
  const response = await axiosClient.get(ENDPOINTS.USERS.GET_ALL, {
    params: { page, limit, search, role },
  });
  return response.data;
};
```

---

## 🔔 Notifications

Use `react-hot-toast` (already configured in `App.jsx`):
```js
import toast from "react-hot-toast";
toast.success("Saved!");
toast.error("Something went wrong");
```
**Do NOT** create custom notification systems or use `alert()`.

---

## 🛠️ Utilities

### `src/utils/validators.js`
Shared validation and phone number utilities:
- `validateRegistration(name, email, password, confirmPassword)` → returns error object or `null`
- `getLastNameInitial(name)` → extracts last word's first character (for avatar)
- `isValidPhoneInput(value)` → checks if input is valid phone characters
- `cleanPhoneNumber(phone, dialCode)` → strips dial code + leading zero

### `src/utils/theme.js`
Dark/light mode management via CSS custom properties:
- `initializeTheme()` — call once on app start (in `main.jsx`), reads `localStorage.getItem("theme")`
- `applyTheme(isDark)` — call when user toggles theme, updates all `--color-mkhe-*` CSS variables

### `src/hooks/useLocations.js`
Shared hook for country/state/dial-code data:
- Fetches from `countriesnow.space` API (runs once on mount)
- Returns `{ countries, availableStates, dialCode }` based on `selectedCountry` parameter
- Has built-in fallback for Vietnam provinces (34 provinces per new admin structure)

---

## 🤖 Agent Skills — ALWAYS Read Before Coding

The following Vercel Agent Skills are installed in `.agents/skills/`. **Read the relevant AGENTS.md / SKILL.md before performing the associated task.**

| Priority | Skill | When to use | File |
|----------|-------|-------------|------|
| 🔴 Critical | React & Next.js Best Practices | Any component, data fetching, performance work | `.agents/skills/vercel-react-best-practices/AGENTS.md` |
| 🔴 Critical | React Composition Patterns | Refactoring props, compound components, Context/Provider | `.agents/skills/vercel-composition-patterns/AGENTS.md` |
| 🟡 High | View Transitions & Animations | Adding animations, page transitions, shared elements | `.agents/skills/vercel-react-view-transitions/SKILL.md` |
| 🟡 High | Vercel Optimization Audit | Slow routes, caching, Core Web Vitals, bundle size | `.agents/skills/vercel-optimize/SKILL.md` |
| 🟢 On-demand | Deploy to Vercel | Deploying the app (always preview, never production unless asked) | `.agents/skills/deploy-to-vercel/SKILL.md` |
| 🟢 On-demand | Vercel CLI with Tokens | CI/CD, token auth (use `VERCEL_TOKEN` env var, never `--token` flag) | `.agents/skills/vercel-cli-with-tokens/SKILL.md` |
| 🟢 On-demand | Web Design Guidelines / UI Audit | Reviewing UI code, accessibility checks | `.agents/skills/web-design-guidelines/SKILL.md` |

---

## ✅ Before Writing Code — Checklist

1. [ ] Read relevant Agent Skill(s) from `.agents/skills/`
2. [ ] Read **Known Issues** section above — don't repeat existing patterns if they're marked as violations
3. [ ] Identify which **feature** the code belongs to
4. [ ] Place code in `features/<name>/` (or `components/ui/`, `hooks/`, `utils/` if truly shared)
5. [ ] Use `@` path alias for all imports
6. [ ] Use `useTranslation("<namespace>")` for all user-facing strings — check namespace table above
7. [ ] Use Tailwind classes — no inline styles, no CSS modules
8. [ ] Use `axiosClient` (never raw `axios`) + `ENDPOINTS` constants
9. [ ] Keep components under 300 lines
10. [ ] Do not import from another feature directly

---

## 🚀 Common Commands

```bash
npm run dev        # Start development server (auto-opens browser)
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

---

## 📌 Environment Variables

Defined in `.env` — all must be prefixed with `VITE_` to be exposed to the client:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL (e.g., `http://localhost:5000/api`) |
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

See `src/config/firebase.js` for how these are consumed.

**Never commit `.env` to version control.**
