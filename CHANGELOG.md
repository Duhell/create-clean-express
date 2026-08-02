# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
