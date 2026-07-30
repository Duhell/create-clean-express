Clean Express CLI - Implementation Plan

Vision

Build an opinionated CLI for Express.js that helps developers create clean, scalable backend APIs using a layered architecture.

The CLI should eliminate repetitive setup while enforcing best practices.

Goals

- Generate production-ready Express projects.
- Enforce clean architecture by default.
- Reduce boilerplate.
- Be beginner-friendly.
- Be customizable for experienced developers.

---

Phase 1 — CLI Foundation

Objective

Create a CLI capable of generating a new Express project.

Commands

npx create-clean-express my-api

or

npx clean-express new my-api

Generates

my-api/
│
├── src/
├── package.json
├── .gitignore
├── .env
└── README.md

Tasks

- Create CLI entry point
- Parse command-line arguments
- Create project directory
- Copy template files
- Install dependencies (optional)
- Initialize Git repository (optional)

---

Phase 2 — Opinionated Project Structure

Generate a standardized project layout.

src/
│
├── config/
├── constants/
├── controllers/
├── middleware/
├── repositories/
├── routes/
├── services/
├── validators/
├── models/
├── utils/
├── errors/
├── database/
├── app.js
└── server.js

Include

- Express setup
- Environment loader
- Global error handler
- Route registration
- Basic logger
- Health check endpoint

---

Phase 3 — Code Generators

Implement generators for common backend components.

Controller

cex make controller User

Creates

controllers/
    UserController.js

---

Service

cex make service User

Creates

services/
    UserService.js

---

Repository

cex make repository User

Creates

repositories/
    UserRepository.js

---

Middleware

cex make middleware Auth

Creates

middleware/
    AuthMiddleware.js

---

Validator

cex make validator User

Creates

validators/
    UserValidator.js

---

Utility

cex make util Hash

Creates

utils/
    Hash.js

---

Error Class

cex make error NotFound

Creates

errors/
    NotFoundError.js

---

Phase 4 — Resource Generator

Generate an entire feature.

cex make resource User

Creates

controllers/
    UserController.js

services/
    UserService.js

repositories/
    UserRepository.js

validators/
    UserValidator.js

routes/
    user.routes.js

Automatically updates

routes/index.js

to register the new route.

---

Phase 5 — Templates

Generated files should not be empty.

Each file should include sensible starter implementations.

Example Controller

- index()
- show()
- store()
- update()
- destroy()

Example Repository

- findAll()
- findById()
- create()
- update()
- delete()

---

Phase 6 — Database Support

Allow users to select a data layer.

Supported providers

- Prisma
- Sequelize
- Mongoose
- Drizzle ORM
- Raw SQL

Example

cex new my-api --database prisma

or

Choose database

> Prisma
  Sequelize
  Mongoose
  None

---

Phase 7 — Validation

Support multiple validation libraries.

Options

- Zod
- Joi
- express-validator
- None

Generated validators should match the selected library.

---

Phase 8 — Authentication Generator

Generate complete authentication modules.

cex make auth

Creates

controllers/AuthController.js

services/AuthService.js

repositories/AuthRepository.js

middleware/AuthMiddleware.js

routes/auth.routes.js

Includes

- Register
- Login
- Refresh Token
- Logout
- Password hashing
- JWT support

---

Phase 9 — Configuration

Generate a configuration file.

Example

{
    "language": "javascript",
    "architecture": "layered",
    "database": "prisma",
    "validation": "zod",
    "testing": "vitest",
    "formatter": "prettier"
}

Future generators read this configuration automatically.

---

Phase 10 — Testing

Support testing frameworks.

Options

- Jest
- Vitest

Example

cex make test User

Creates

tests/

user.controller.test.js

user.service.test.js

---

Phase 11 — Plugins

Allow optional integrations.

Examples

cex add swagger

cex add docker

cex add redis

cex add bullmq

cex add socketio

Each plugin installs dependencies and configures the project.

---

Phase 12 — API Documentation

Generate OpenAPI documentation.

cex make docs

Automatically scans routes and creates Swagger configuration.

---

Phase 13 — Deployment

Provide deployment templates.

Support

- Docker
- Docker Compose
- Railway
- Render
- Fly.io
- DigitalOcean

---

Phase 14 — Developer Experience

Improve usability.

Features

- Interactive prompts
- Colored terminal output
- Progress indicators
- Command help
- Auto-completion
- Template previews

Example

✔ Creating project...

✔ Installing dependencies...

✔ Configuring Express...

✔ Done!

---

Phase 15 — Documentation

Create comprehensive documentation.

Include

- Installation
- Project structure
- Architecture explanation
- CLI commands
- Examples
- Plugin guide
- Contribution guide

---

Future Features

TypeScript Support

cex new my-api --typescript

---

Feature Modules

src/

modules/

User/

UserController.js

UserService.js

UserRepository.js

user.routes.js

UserValidator.js

---

Dependency Injection

Optional support for dependency injection containers.

---

Event System

Support application events.

Example

UserCreated

PasswordReset

OrderPaid

---

Queue Support

Generate queue workers.

cex make queue Email

---

Scheduler

Generate scheduled jobs.

cex make job Cleanup

---

File Storage

Support

- Local
- AWS S3
- Cloudinary

---

Email

Generate mail services.

Support

- Nodemailer
- Resend
- SendGrid

---

Example Workflow

npx create-clean-express ecommerce-api

cd ecommerce-api

cex make resource User

cex make resource Product

cex make middleware Auth

cex make auth

cex add swagger

cex add docker

npm run dev

---

Success Criteria

- Minimal setup time for new projects.
- Consistent project structure across teams.
- Reduced boilerplate.
- Easy onboarding for new developers.
- Extensible plugin ecosystem.
- Production-ready defaults with minimal configuration.

---

Long-Term Vision

Become the go-to CLI for developers who want Express.js without sacrificing maintainability. Rather than replacing Express, the project should enhance it by providing a standardized, scalable architecture and a rich developer experience similar to what Laravel Artisan or NestJS CLI offers for their ecosystems.