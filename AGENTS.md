# AGENTS.md — UranusData

## Project Overview

**UranusData** — SENA Sistema Integrado de Gestión. Angular 22 standalone frontend + Laravel 12 REST API backend (Sanctum auth).

- Frontend root: `./` (Angular 22, `@angular/build:application`)
- Backend: `./laravel-backend/` (Laravel 12, Sanctum, MySQL)
- Roles: Docente (1), Gerente (2), Técnico (3)

## Dev Commands

```bash
# Start both frontend (4200) + backend concurrently
npm start

# Start frontend only
npm run start:frontend    # ng serve on :4200

# Start backend only
npm run start:backend     # php artisan serve --port=3000

# Full backend setup (from laravel-backend/)
composer install && cp .env.example .env && php artisan key:generate && php artisan migrate && php artisan db:seed
```

**No `npm run build`, `npm run lint`, or `npm run test` scripts** exist at root — Angular uses `ng` directly (`ng build`, `ng serve`, etc.).

## Architecture Notes

- **Standalone Angular components** — no NgModules; routes use `loadComponent` lazy loading.
- **API base URL**: `environment.apiUrl` = `http://localhost:8000/api` (set in `src/environments/environment.ts`).
- **Auth flow**: Sanctum CSRF cookie first (`/sanctum/csrf-cookie`), then `POST /api/login` with `withCredentials: true`. Tokens stored in `localStorage`.
- **Auth interceptor** auto-attaches `Bearer` token for requests matching `environment.apiUrl`.
- **Guards**: `authGuard` (token check) + `rolesGuard` (route param `:rol` must match user role).
- **Many routes return `EnConstruccion` component** (under construction): `usuario/gestion`, `inventario/*`, `mantenimiento/*`, `reserva/*`.
- **`app.routes.ts`** is the single source of truth for all routes and role gating.

## ⚠️ Common Gotchas

- **Port mismatch**: `start:backend` uses `--port=3000`, but `environment.ts` and `.env.example` point to **port 8000**. If using `npm start`, the backend runs on 3000 but the Angular app calls 8000. Use `php artisan serve` (defaults to 8000) or Docker to match.
- **No `.env` at repo root** — Laravel env lives in `laravel-backend/.env`. Copy from `.env.example` first.
- **Docker**: `docker-compose up -d` exposes frontend on 8000, phpMyAdmin on 8080. Run `docker-compose exec app php artisan migrate` after startup.
- **`composer.json` `setup` script** does everything: `composer install` → copy `.env` → `key:generate` → `migrate --force` → `npm install` → `npm run build`.

## Styling & Formatting

- **Prettier**: `singleQuote: true`, `printWidth: 100`, Angular HTML parser for `*.html`.
- **EditorConfig**: 2-space indent, UTF-8, single quotes for `.ts`.
- **CSS variables** in `src/styles.css` define theming (light/dark mode via `body.dark-mode`).

## Auth System

- **Login rate limiting**: 5 attempts, 15-min block via Laravel `Cache` (`login_intentos_{documento}`, `login_bloqueado_{documento}` keys).
- **Login validation**: `documento` must be exactly 10 digits (`digits:10`); `password` must be 6–15 chars.
- **Login state checks**: state 2 → inactive message (403), state 3 → blocked message (403), other → invalid state (403).
- **Password recovery flow**: `POST /api/recuperar-contrasena/solicitar` → `AuthController::solicitarRecuperacion` (validates `documento` digits:10 + `correo` email, checks state, generates token, sends email via `NotificationMail`).
- **Recovery state checks**: state 2 → inactive, state 3 → blocked (both 403).
- **Activar cuenta**: rejects state 3 (blocked) before activating.
- **Frontend**: All plain class properties (not Angular signals) use direct assignment (`this.error = ''`) — `.set()` is only for Signals.

## Key Files (cont.)

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | API URL config |
| `src/app/app.routes.ts` | All routes + guards |
| `src/app/core/service/auth.service.ts` | Auth logic (login, logout, CSRF) |
| `src/app/core/interceptors/auth.interceptor.ts` | Bearer token injection |
| `laravel-backend/routes/api.php` | All API endpoints |
| `laravel-backend/.env.example` | Backend env template |
| `laravel-backend/docker-compose.yml` | Docker setup (app + MySQL + phpMyAdmin) |
