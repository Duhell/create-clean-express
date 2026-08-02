# 🚀 create-clean-express

> An opinionated CLI for building **clean, scalable Express.js APIs** with a layered architecture — like Laravel Artisan, but for Express.

[![npm version](https://img.shields.io/npm/v/create-clean-express.svg)](https://www.npmjs.com/package/create-clean-express)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org)

---

## ✨ Features

- ⚡ **One command** to scaffold a production-ready Express project
- 🏛️ **Layered architecture** — controllers, services, repositories, validators
- 🔧 **Code generators** — generate any layer individually or as a full resource
- 🔐 **Auth generator** — complete JWT authentication module out of the box
- 🧩 **Plugin system** — add Swagger, Docker, Redis, BullMQ, Socket.IO in one command
- 📄 **Swagger-ready routes** — all generated routes include JSDoc annotations
- 🌱 **Beginner-friendly**, but powerful enough for experienced teams

---

## 📦 Installation

### Option 1 — Use directly with npx (no install needed)

```bash
npx create-clean-express my-api
```

### Option 2 — Install globally

```bash
npm install -g create-clean-express
cex new my-api
```

---

## 🛠️ Commands

### `cex new <project-name>`

Scaffold a new Express project with clean architecture.

```bash
cex new my-api
cex new my-api --pattern service-model
cex new my-api --pattern repository
cex new my-api --database prisma
cex new my-api --database mongoose --validation zod
cex new my-api --no-install --no-git
```

**Options:**

| Flag | Description | Default |
|---|---|---|
| `--pattern <type>` | `service-model` (default clean pattern) \| `repository` | `service-model` |
| `--database <type>` | `sqlite` \| `mysql` \| `prisma` \| `sequelize` \| `mongoose` \| `drizzle` \| `none` | `none` |
| `--validation <lib>` | `zod` \| `joi` \| `express-validator` \| `none` | `none` |
| `--no-install` | Skip `npm install` | — |
| `--no-git` | Skip `git init` | — |

---

### `cex make <type> <name>`

Generate individual components inside an existing project.

```bash
# Single generators
cex make controller User
cex make service User
cex make model User
cex make migration create_users_table
cex make route User
cex make repository User
cex make middleware Auth
cex make validator User
cex make util Hash
cex make error NotFound

# Full resource (controller, service, model, validator, route, auto-registers in routes/index.js)
cex make resource User

# Complete authentication module (JWT)
cex make auth

# Test stubs
cex make test User
```

---

### `cex migrate`

Run pending database migrations from `src/database/migrations/`.

```bash
cex migrate
```

---

### `cex add <plugin>`

Add optional integrations to an existing project.

```bash
cex add swagger    # OpenAPI docs via swagger-ui-express
cex add docker     # Dockerfile + docker-compose.yml
cex add redis      # ioredis client config
cex add bullmq     # BullMQ queue + worker setup
cex add socketio   # Socket.IO server config
```

---

## 📁 Generated Project Structure

```
my-api/
├── src/
│   ├── config/           # App config (port, jwt, db)
│   ├── constants/        # HTTP status codes & app constants
│   ├── controllers/      # Route handlers (thin layer)
│   ├── middleware/        # Express middleware
│   ├── repositories/     # Data access layer (DB queries)
│   ├── routes/           # Express routers
│   ├── services/         # Business logic layer
│   ├── validators/       # Input validation
│   ├── models/           # Data models / schemas
│   ├── utils/            # Shared utilities
│   ├── errors/           # Custom error classes
│   ├── database/         # DB connection setup
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
├── tests/
├── .env
├── .env.example
├── .gitignore
├── cex.config.json       # CLI config (read by generators)
├── package.json
└── README.md
```

---

## 🏗️ Architecture

The CLI enforces a **layered (n-tier) architecture**:

```
Request → Router → Controller → Service → Repository → Database
                                    ↓
                               Validator
                                    ↓
                              Middleware
```

| Layer | Responsibility |
|---|---|
| **Controller** | Handle HTTP request/response, delegate to service |
| **Service** | Business logic, orchestration |
| **Repository** | All database access — the only layer that touches the DB |
| **Validator** | Input validation before reaching the controller |
| **Middleware** | Cross-cutting concerns (auth, rate-limit, logging) |

---

## ⚡ Example Workflow

```bash
# 1. Create project
npx create-clean-express ecommerce-api
cd ecommerce-api

# 2. Generate resources
cex make resource User
cex make resource Product
cex make resource Order

# 3. Add authentication
cex make auth

# 4. Add middleware
cex make middleware RateLimit

# 5. Add integrations
cex add swagger
cex add docker

# 6. Generate tests
cex make test User
cex make test Product

# 7. Run
npm run dev
```

---

## 🔒 Auth Module (`cex make auth`)

Generates a complete JWT authentication flow:

| File | Purpose |
|---|---|
| `controllers/AuthController.js` | register, login, refresh, logout, me |
| `services/AuthService.js` | bcrypt hashing, JWT signing |
| `repositories/AuthRepository.js` | DB queries for users |
| `middleware/AuthMiddleware.js` | JWT verification middleware |
| `routes/auth.routes.js` | Auth route definitions |

**Endpoints generated:**

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

---

## 📄 cex.config.json

Generated at project root. Future generators read this automatically.

```json
{
  "language": "javascript",
  "architecture": "layered",
  "database": "prisma",
  "validation": "zod",
  "testing": "jest",
  "formatter": "prettier"
}
```

---

## 🗺️ Roadmap

| Phase | Feature | Status |
|---|---|---|
| 1 | CLI Foundation | ✅ Done |
| 2 | Project Scaffolding | ✅ Done |
| 3 | Code Generators | ✅ Done |
| 4 | Resource Generator | ✅ Done |
| 5 | Sensible Templates | ✅ Done |
| 6 | Database Selection | 🔜 Planned |
| 7 | Validation Library Selection | 🔜 Planned |
| 8 | Auth Generator | ✅ Done |
| 9 | Config File | ✅ Done |
| 10 | Testing Framework | 🔜 Planned |
| 11 | Plugins | ✅ Done |
| 12 | API Documentation | 🔜 Planned |
| 13 | Deployment Templates | 🔜 Planned |
| 14 | Interactive Prompts & DX | 🔜 Planned |
| 15 | TypeScript Support | 🔜 Future |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT © create-clean-express contributors
