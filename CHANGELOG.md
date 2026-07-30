# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/Duhell/create-clean-express/releases/tag/v0.1.0
