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
| **Auth** | Firebase + JWT (stored in Zustand) |
| **i18n** | i18next + react-i18next |
| **Notifications** | react-hot-toast |
| **Icons** | lucide-react |
| **Path alias** | `@` → `src/` |
| **Dev server** | `npm run dev` (port configured in vite.config.js) |
| **Linting** | ESLint 10 + eslint-plugin-react-hooks |
| **Git hooks** | Husky |

---

## 📁 Folder Structure

```
frontend/
├── .agents/skills/         ← Vercel Agent Skills (read before coding)
├── src/
│   ├── api/                ← HTTP layer ONLY (axiosClient, *Api.js files)
│   ├── assets/             ← Static assets (images, fonts, svgs)
│   ├── components/
│   │   ├── layout/         ← App-wide layouts (AuthLayout, MainLayout)
│   │   ├── router/         ← Route guards (ProtectedRoute, AuthRoute)
│   │   └── ui/             ← Shared reusable primitives (no business logic)
│   ├── config/             ← App configuration (firebase, etc.)
│   ├── constants/          ← App-wide constants
│   ├── features/           ← ALL business logic lives here (colocated)
│   │   ├── auth/
│   │   └── users/
│   ├── hooks/              ← Shared hooks only (not feature-specific)
│   ├── i18n.js             ← i18next configuration
│   ├── locales/            ← Translation files
│   ├── pages/              ← Thin page components (routing only)
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── home/
│   │   └── users/
│   ├── stores/             ← Zustand stores (useAuthStore.js, etc.)
│   └── utils/              ← Shared utility functions
├── AGENTS.md               ← THIS FILE
├── package.json
└── vite.config.js
```

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
    auth.service.js         ← API calls + data transformation
    auth.types.js           ← Feature-specific types/shapes
    auth.constants.js       ← Feature-specific constants
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
- `axiosClient.js` is the single Axios instance — always import from here
- Feature-specific API calls go in `features/<name>/auth.service.js`, NOT in `src/api/`
- `src/api/*.js` files are for shared/global API wrappers only

### Rule 4 — State Management (Zustand)
- Stores live in `src/stores/` (e.g., `useAuthStore.js`)
- Each store handles ONE concern (auth, ui, etc.)
- Do NOT put API calls directly in stores — call services, store results

### Rule 5 — Shared vs Feature Code

| Type | Where it goes |
|------|--------------|
| Feature component | `features/<name>/components/` |
| Shared UI primitive (Button, Input, Modal) | `components/ui/` |
| Feature hook (`useAuth`) | `features/<name>/` |
| Shared hook (`useDebounce`) | `hooks/` |
| Feature constants | `features/<name>/auth.constants.js` |
| App-wide constants | `constants/` |
| Feature types/shapes | `features/<name>/auth.types.js` |
| Global types | (use JSDoc in JS project) |

### Rule 6 — Cross-Feature Imports Are FORBIDDEN
Features MUST NOT import from other features directly.
```js
// ❌ NEVER do this
import { useAuth } from "@/features/auth/useAuth";  // inside features/users/
```
Use Zustand stores or shared `hooks/` to share state across features.

### Rule 7 — File Size Limit
Component files must stay **< 300 lines**. Extract subcomponents or hooks when approaching the limit.

### Rule 8 — No Barrel Files
Avoid `index.js` that re-exports everything from a feature folder. Import directly from the specific file.

---

## 🎨 Styling Rules

- **Tailwind CSS v4** is used (configured via `@tailwindcss/vite` plugin — no `tailwind.config.js` needed)
- Use Tailwind utility classes directly in JSX — no separate CSS modules for components
- Global styles and CSS variables go in `src/index.css`
- Component-level `*.css` files are discouraged; prefer Tailwind
- **Do NOT use inline `style={}` props** unless for truly dynamic computed values

---

## 🔗 Path Aliases

Always use the `@` alias for imports:
```js
// ✅ CORRECT
import axiosClient from "@/api/axiosClient";
import Button from "@/components/ui/Button";

// ❌ WRONG
import axiosClient from "../../api/axiosClient";
```

---

## 🌐 Routing & Auth

- **React Router DOM v7** — use `<Routes>` / `<Route>` pattern (already set up in `App.jsx`)
- `ProtectedRoute` — wraps routes that require authentication + role check (`allowedRoles`)
- `AuthRoute` — redirects already-authenticated users away from login/register pages
- Auth state is managed by Zustand `useAuthStore` in `src/stores/useAuthStore.js`

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
- Translation files live in `src/locales/<lang>/`
- Always use `useTranslation` hook — never hardcode user-facing strings
```jsx
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
return <p>{t("auth.login.title")}</p>;
```

---

## 📡 HTTP / API Conventions

- **Axios instance**: `src/api/axiosClient.js` — has interceptors for auth tokens and error handling
- **API files**: named `<feature>Api.js` (e.g., `authApi.js`, `userApi.js`) inside `src/api/`
- **Services**: feature-level data transformation + API orchestration in `features/<name>/<name>.service.js`
- **Proxy**: `/api/*` requests are proxied to `VITE_API_BASE_URL` in dev (see `vite.config.js`)

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
| 🟢 On-demand | Find Skills | Discovering additional agent skills | `.agents/skills/find-skills/SKILL.md` |

---

## ✅ Before Writing Code — Checklist

1. [ ] Read relevant Agent Skill(s) from `.agents/skills/`
2. [ ] Identify which **feature** the code belongs to
3. [ ] Place code in `features/<name>/` (or `components/ui/`, `hooks/`, `utils/` if truly shared)
4. [ ] Use `@` path alias for all imports
5. [ ] Use `useTranslation` for all user-facing strings
6. [ ] Use Tailwind classes — no inline styles, no CSS modules
7. [ ] Keep components under 300 lines
8. [ ] Do not import from another feature directly

---

## 🚀 Common Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

---

## 📌 Environment Variables

Defined in `.env` — all must be prefixed with `VITE_` to be exposed to the client:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| Firebase config vars | See `src/config/` |

**Never commit `.env` to version control.**
