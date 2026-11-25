# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.7.0] - 2026-11-25

### Added

- **`cex add mail` Plugin**: Added SMTP mail plugin using `nodemailer` (`src/config/mail.js|ts` and `src/services/MailService.js|ts` with `queue().sendMail()` fallback).
- **`cex add audit` Plugin**: Added `audit_logs` migration, `EventEmitter`-based `AuditService` (`auth.login`, `auth.logout`, `auth.register`, `crud.create`, `crud.update`, `crud.delete` with `oldData`/`newData`), and `AuditMiddleware`.
- **ORM Connection & Prisma Schema Scaffolding**: `dbTemplate` now generates real connection setups for `prisma`, `mongoose`, `sequelize`, and `drizzle`; `cex new --database prisma` scaffolds `prisma/schema.prisma`.
- **Auth Route Validation**: `cex make auth` now generates `src/validators/AuthValidator.js|ts` (for `zod`, `joi`, `express-validator`, or custom validation) and wires `validate(...)` onto `/register` and `/login`.
- **Auto-Install Auth Dependencies**: `cex make auth` runs `npm install` automatically when `node_modules` already exists in the project.
- **End-to-End TypeScript CI**: CI now installs, builds, and runs `npm test` inside `smoke-test-ts`.

---

## [0.6.0] - 2026-11-25

### Added

- **`cex upgrade` Command**: Checks project compatibility (`cex.config.json`, `layered` architecture, ESM) and non-destructively adds missing helpers (`asyncHandler`, `pagination`, `validate`), `.prettierrc`, `eslint.config.js`, `jest.config.js` (for TS), and `tests/health.test.*`, with `--dry-run` support.
- **`cliVersion` Tracking**: `cex new` and `cex upgrade` record `cliVersion` in `cex.config.json`.

### Fixed

- **Single Source of Truth for `HTTP_STATUS`**: Replaced remaining hardcoded numeric status codes in `error` templates (`400` -> `HTTP_STATUS.BAD_REQUEST`), `authController` (`201` -> `HTTP_STATUS.CREATED`), and `/health` routes (`HTTP_STATUS.OK`).

---

## [0.5.0] - 2026-11-25

### Added

- **Database-Wired `AuthRepository`**: `cex make auth` now generates real adapter-specific queries for `sqlite` (`better-sqlite3`), `mysql` (`mysql2/promise`), `prisma`, and an in-memory `Map` store when `database` is `none`.
- **Linting, Formatting & TS Jest Config**: Scaffolded projects now include `.prettierrc`, `eslint.config.js`, `lint`/`format` scripts, `ts-jest` + `jest.config.js` for TypeScript projects, and a passing `tests/health.test.js|ts` starter test.
- **End-to-End CI Verification**: CI now installs dependencies and runs `npm test` inside a freshly scaffolded project.

---

## [0.4.0] - 2026-11-25

### Added

- **Route Auto-Discovery**: Newly scaffolded `src/routes/index.js|ts` automatically discovers and mounts `*.routes.js|ts` files in `src/routes/` (backward-compatible with older marker-based `routes/index` files).
- **Auto-Mounted Swagger**: `src/app.js|ts` automatically mounts `/api-docs` when `src/config/swagger.js|ts` is added via `cex add swagger`.
- **Developer Helpers**: Added `src/utils/asyncHandler.js|ts`, `src/utils/pagination.js|ts` (`getPagination`), and `src/middleware/validate.js|ts` (tailored for `zod`, `joi`, `express-validator`, or custom schemas).
- **TypeScript-Aware Plugins**: `cex add` (`swagger`, `docker`, `redis`, `bullmq`, `socketio`) now reads `cex.config.json` and generates `.ts` files and TS Docker builds for TypeScript projects.
- **Testing Framework Setup**: Scaffolded projects now include `jest` and `supertest` in `devDependencies` with an ESM-ready `npm test` script.

---

## [0.3.0] - 2026-11-25

### Security & Reliability

- **Project Name Validation**: `cex new` now validates `projectName` to prevent path traversal (`..`, `/`, `\`) and invalid package names.
- **Cross-Platform Migrations**: `cex migrate` now uses `pathToFileURL()` so dynamic migration imports work on Windows as well as Unix.
- **Separate Access & Refresh JWT Secrets**: `cex make auth` and scaffolded configs now use separate `JWT_SECRET` and `JWT_REFRESH_SECRET` secrets, enforce `type: 'access'` / `type: 'refresh'` token claims, and fail fast in production if secrets are missing or left as defaults.
- **Rate Limiting & Body Size Limits**: Scaffolded apps now include `express-rate-limit` on `/api/` routes (plus stricter limits on auth endpoints) and `100kb` body size limits on `express.json` / `express.urlencoded`.
- **CORS & Docker Hardening**: Restricted default CORS configuration via `CORS_ORIGIN`, updated `Dockerfile` to run as non-root `USER node`, and removed hardcoded Postgres credentials from `docker-compose.yml`.
- **Cross-Platform Start Script**: Added `cross-env` for `npm start` in scaffolded projects.
- **Documentation & Tests**: Cleaned up `README.md` and `package.json` descriptions (removed emojis and aligned with implemented features), and added `node:test` suite.

---

## [0.2.2] - 2026-08-02

### Added

- **Sample Route**: Scaffolded projects now include a sample route (`GET /` and `GET /sample`) returning HTTP status `200` with JSON message `{ "message": "connected to backend successfully" }`.
- **`cex make route <name>`**: Added CLI command to generate a standalone route file (`src/routes/<name>.routes.js` or `.ts`) with RESTful endpoint handlers and automatic route registration in `src/routes/index.js` (or `index.ts`).
- **`BaseModel` Class & `cex make model <name>`**: Added a lightweight base model (`src/models/BaseModel.js` / `.ts`) providing Eloquent-like static query methods (`find`, `findAll`, `where`, `create`, `update`, `delete`, `query`), and added `cex make model <name>` to generate models extending `BaseModel`.
- **Database Migrations (`cex make migration` & `cex migrate`)**: Added `cex make migration <name>` to generate timestamped migration files in `src/database/migrations/`, and added `cex migrate` command to execute pending database migrations.
- **`--pattern` Scaffolding Option**: Added `--pattern` flag (`service-model` [default] | `repository`) to `cex new` so projects default to a simplified Service-Model architecture without forcing repositories.

### Changed

- **Removed Repositories by Default**: Repositories are no longer scaffolded by default to reduce complexity, unless `--pattern=repository` is explicitly provided.
- **Simplified Controller & Service Boilerplates**: Simplified `cex make controller` to generate clean `try { } catch (err) { next(err); }` methods, and simplified `cex make service` to generate a decoupled business logic class.
- **Centralized `HTTP_STATUS` Constants**: Centralized all HTTP response status codes across all templates, controllers, routes, error handlers, and response utilities using `HTTP_STATUS` constants from `src/constants/index.js`.

---

## [0.2.0] - 2026-08-01

### Changed

- **ES Modules (ESM)**: Refactored the entire CLI package and all scaffolded templates from CommonJS to native ES Modules (`import`/`export`).
- **Node.js LTS Engine**: Upgraded minimum Node.js engine requirement to `>=22.0.0` in both CLI and scaffolded projects.
- **Interactive Database Choice**: Removed automatic `none` default when scaffolding — `cex new` and `create-clean-express` now prompt for database selection interactively.
- **Upgraded Dependencies**: Upgraded `chalk` to `^5.3.0` and `ora` to `^8.0.1`.

### Added

- **TypeScript Support**: Interactive prompt during `cex new` to generate `.ts` projects complete with `tsconfig.json`, `ts-node-dev`, and types.
- **SQLite & MySQL Drivers**: Added `sqlite` (`better-sqlite3`) and `mysql` (`mysql2`) database options.
- **Automated Error Logs**: Added `logs/` directory scaffolding (included in `.gitignore`) and automatic error file logging (`logs/error-YYYY-MM-DD.txt`) via `logErrorToFile` utility integrated into the global error handler.

---

## [0.1.0] - 2026-07-31

### Added

- `cex new <project>` — scaffold a full Express project with layered architecture
- `cex make controller <Name>` — generate a controller with index/show/store/update/destroy
- `cex make service <Name>` — generate a service with full CRUD methods
- `cex make repository <Name>` — generate a repository with ORM placeholder comments
- `cex make middleware <Name>` — generate an Express middleware
- `cex make validator <Name>` — generate a validator with create/update schemas
- `cex make util <Name>` — generate a utility module
- `cex make error <Name>` — generate a custom error class extending AppError
- `cex make resource <Name>` — generate all layers at once + auto-register route
- `cex make auth` — generate a complete JWT authentication module
- `cex make test <Name>` — generate Jest controller and service test stubs
- `cex add swagger` — add OpenAPI docs via swagger-ui-express
- `cex add docker` — add Dockerfile + docker-compose.yml
- `cex add redis` — add ioredis client configuration
- `cex add bullmq` — add BullMQ queue and worker setup
- `cex add socketio` — add Socket.IO server configuration
- `cex.config.json` — project config generated at root, read by generators
- `--database` flag on `cex new` (prisma, sequelize, mongoose, drizzle, none)
- `--validation` flag on `cex new` (zod, joi, express-validator, none)
- `--no-install` and `--no-git` flags on `cex new`
- Global error handler middleware
- 404 not found middleware
- Health check endpoint (`GET /health`)
- Swagger JSDoc annotations on all generated routes

[0.2.2]: https://github.com/Duhell/create-clean-express/releases/tag/v0.2.2
[0.2.0]: https://github.com/Duhell/create-clean-express/releases/tag/v0.2.0
[0.1.0]: https://github.com/Duhell/create-clean-express/releases/tag/v0.1.0
