# Yesen CRM Backend

Backend for the Yesen Technologies Admin Panel — a CRM with a hard-coded
Kanban pipeline for managing inquiries coming in from the website (Product
pages, Service pages, Contact page). Built to the spec in the 05/08 MOM.

Stack: **Node.js (ES Modules) + Express + MongoDB (Mongoose)**, package manager: **pnpm**.

> This codebase uses native ES Modules (`import`/`export`), not CommonJS —
> `package.json` sets `"type": "module"`. A few things that differ from a
> typical CJS Express project, worth knowing before you touch the code:
>
> - Every relative import needs an explicit `.js` extension (`import x from './foo.js'`, not `'./foo'`) — Node's ESM resolver doesn't guess extensions the way `require` does.
> - `.eslintrc.cjs` is deliberately `.cjs`, not `.js` — ESLint's own config loader needs CommonJS regardless of the package type.
> - `smoke-test.js` sets test env vars, then uses dynamic `await import(...)` (not a static `import`) to load the app — static imports are hoisted and would run before those env vars were set.
> - Everything else (routes, controllers, services, repositories, models) is plain top-level `import`/`export`.

## Architecture

Strict layering, each layer only talks to the one below it:

```
routes  →  validators (Joi)  →  controllers  →  services  →  repositories  →  models (Mongoose)
```

- **routes/** — wires HTTP verbs + paths to validators + controllers. No logic.
- **validators/** — Joi schemas. Rejects bad input before it reaches a controller.
- **controllers/** — thin HTTP layer: read `req`, call a service, shape `res`. No DB calls, no business rules.
- **services/** — all business logic (auto-tagging, pipeline rules, orchestration). Calls repositories, never Mongoose models directly. Throws `ApiError` for anything the caller did wrong.
- **repositories/** — the _only_ place Mongoose models are queried. Pure data access, no business rules.
- **models/** — Mongoose schemas.

Why: DB queries and business logic living in the same function (the original version's controllers) makes both harder to test and to change independently — e.g. swapping Mongo for something else, or reusing "move a card to Lost" logic from a script, would have meant copy-pasting controller code. Now the service layer is what you'd unit test or reuse, and the repository layer is the only thing that would need to change if the datastore ever changed.

```
src/
  app.js                Express app: security/logging/rate-limit middleware, route mounting
  server.js              Entry point: validates env, connects DB, graceful shutdown
  config/
    env.js                 Joi-validated environment config — see "Environments" below
    logger.js               pino structured logger
    db.js                    Mongo connect/disconnect
    pipeline.js              THE hard-coded Kanban stage list + inquiry sources
  models/                 User, Inquiry, InteractionLog, Document (Mongoose schemas)
  repositories/            One file per model — DB queries only
  services/                 One file per resource — business logic only
  controllers/              One file per resource — thin HTTP layer only
  validators/                Joi schemas per resource
  routes/                     Route wiring
  middleware/
    auth.js                    JWT auth + forms-key auth
    validate.js                 generic Joi-validation middleware
    upload.js                    multer config
    rateLimit.js                  general + forms-specific limiters
    requestId.js                   correlation ID per request
    errorHandler.js                 normalizes all errors → consistent JSON + pino logs
  utils/
    ApiError.js               operational error class (`ApiError.notFound()`, `.badRequest()`, ...)
    autoTag.js                 auto-tagging rule (product/service name vs "Open")
    seed.js                     creates/updates the first admin user
```

## Environments (dev / uat / production)

Everything environment-specific — Mongo URI, secrets, CORS origins, log
level, rate limits — is validated once at boot in `src/config/env.js`
(via Joi) and lives in `.env.{NODE_ENV}`. Nothing else in the codebase
reads `process.env` directly, so switching environments is purely a
`NODE_ENV` change:

| Command      | NODE_ENV      | Loads              | Use for                                 |
| ------------ | ------------- | ------------------ | --------------------------------------- |
| `pnpm dev`   | `development` | `.env.development` | local development, nodemon auto-restart |
| `pnpm uat`   | `uat`         | `.env.uat`         | staging / UAT server                    |
| `pnpm start` | `production`  | `.env.production`  | production server                       |

Setup:

```bash
pnpm install

cp .env.development.example .env.development   # fill in local Mongo URI, secrets
cp .env.uat.example .env.uat                     # fill in UAT Mongo URI, secrets (or set via host's secret manager)
cp .env.production.example .env.production        # same, for production

pnpm seed:dev     # creates the first admin login for that environment
pnpm dev           # http://localhost:5000
```

Only the `.example` files are committed — real `.env.*` files are
gitignored so secrets never end up in source control. If `MONGO_URI`,
`JWT_SECRET`, or `FORMS_API_KEY` are missing or malformed for whichever
environment you start, the app **fails fast at boot** with a clear message
instead of misbehaving at request time — see `src/config/env.js` for the
full validation schema.

## Running the tests

```bash
pnpm test:smoke
```

Spins up an in-memory MongoDB (downloads a binary the first time — needs
outbound internet access to mongodb.org) and runs the full MOM flow
end-to-end: login → form intake (all 3 sources) → auto-tagging → Joi
validation rejections → Kanban board → drag-and-drop stage move → invalid
stage rejection → drawer detail → malformed-ID handling → tags → logs →
quotation status → document upload.

## Code quality

```bash
pnpm lint          # eslint (airbnb-base + prettier)
pnpm lint:fix
pnpm format        # prettier --write
pnpm format:check
```

## What's implemented (mapped to the MOM)

| MOM item                                  | Implementation                                                                                                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2. Admin Panel / CRM with Kanban          | `GET /api/inquiries?board=true` returns cards grouped into the 6 pipeline columns                                                                                                                             |
| 3. Hard-coded pipeline                    | Stages fixed in `src/config/pipeline.js`, enforced by both Joi (`moveStage` schema) and the service layer. No dynamic stage CRUD exists.                                                                      |
| 4. Multi-form aggregation & tagging       | `/api/forms/product`, `/api/forms/service`, `/api/forms/contact` — each creates an Inquiry and auto-tags it (product/service name, or `"Open"` for the contact page). Manual tags can be added/removed later. |
| 5 & 6. Slide-in drawer, no page nav       | `GET /api/inquiries/:id` returns inquiry + full interaction log + documents in one call.                                                                                                                      |
| 7. Quotation status + document attachment | `PATCH /api/inquiries/:id/quotation` (mark sent/not sent) and `POST /api/inquiries/:id/documents` (upload invoice/quotation files). No full invoice generation, as scoped.                                    |

## Production-readiness additions

- **API versioning**: all routes are served at `/api/v1/...`. Bump `API_VERSION` (env) and add a new route tree to introduce `v2` without breaking existing consumers. An unversioned `/api/...` alias is also mounted for backward compatibility with anything wired up before versioning existed — drop it once nothing depends on it.
- **Security**: `helmet`, `express-mongo-sanitize` (NoSQL-injection guard), rate limiting — a general API limiter, a stricter one on public form intake, and a separate brute-force limiter on `POST /api/v1/auth/login` (5 failed attempts / 15 min by default; successful logins don't count against it, so a legitimate user mistyping their password isn't locked out alongside an actual attacker).
- **Observability**: structured `pino` logs (pretty in dev, JSON everywhere else) with a request ID on every request/response/error for tracing a single request through the logs. Optionally (`LOG_TO_FILE=true`) logs also rotate to dated files on disk (`logs/app.YYYY-MM-DD.N.log`, daily + 20MB size rotation, bounded to `LOG_RETENTION_DAYS` files) so a single log file never grows forever and old days roll off automatically — on by default in the uat/production examples, off in dev (console is enough locally).
- **Reliability**: graceful shutdown on SIGTERM/SIGINT (finishes in-flight requests, closes the Mongo connection before exiting) — important for zero-downtime deploys.
- **Input validation**: every route validates `body`/`query`/`params` with Joi before touching a controller; malformed ObjectIds, missing fields, and invalid enum values are rejected with 400s instead of crashing as 500s.
- **Config validation**: fails fast at boot if required env vars are missing/malformed, per environment.

## API documentation (Swagger + Postman)

Interactive docs and a ready-to-import Postman collection live under `docs/`:

| Resource | URL / path |
| -------- | ---------- |
| Swagger UI | http://localhost:5000/api-docs (with `pnpm dev` running) |
| OpenAPI JSON | http://localhost:5000/api-docs.json |
| Written guide | [`docs/API.md`](./docs/API.md) |
| Postman collection | [`docs/Yesen-CRM-API.postman_collection.json`](./docs/Yesen-CRM-API.postman_collection.json) |
| Postman environment | [`docs/Yesen-CRM-Local.postman_environment.json`](./docs/Yesen-CRM-Local.postman_environment.json) |

Authorize in Swagger with the login JWT (`bearerAuth`) and/or `FORMS_API_KEY`
(`formsApiKey`). In Postman, run **Auth → Login** first — it stores `token`
automatically.

## API reference

Base path: `/api/v1` (an unversioned `/api` alias also works — see
"Production-readiness additions" above). All admin-panel routes require
`Authorization: Bearer <token>` from login, unless noted. Error responses
are `{ error, requestId, details? }`.

Full endpoint tables, auth notes, and a suggested smoke flow are in
[`docs/API.md`](./docs/API.md). Summary below.

### Auth

- `POST /api/v1/auth/login` — `{ username, password }` → `{ token, user }`. Limited to 5 failed attempts / 15 min per IP by default (`AUTH_RATE_LIMIT_*`).
- `GET /api/v1/auth/me` — current user
- `PATCH /api/v1/auth/password` — `{ currentPassword, newPassword }` — self-service password change for the logged-in user (added for the frontend's Settings page; distinct from the admin-only `PATCH /users/:id`, which doesn't require the current password).

### Public form intake (needs `x-forms-key` header, not user auth)

- `POST /api/v1/forms/product` — `{ clientName, email, phone, company?, message?, productOrServiceName, sourcePage? }`
- `POST /api/v1/forms/service` — same shape, tags with `productOrServiceName`
- `POST /api/v1/forms/contact` — same shape without `productOrServiceName`; auto-tagged `"Open"`

### Inquiries / Kanban board

- `GET /api/v1/inquiries?board=true` — 6 columns in pipeline order, each with its cards
- `GET /api/v1/inquiries?tag=&source=&q=` — flat filtered list (search by name/email/phone/company)
- `GET /api/v1/inquiries/:id` — full drawer payload: `{ inquiry, logs, documents }`
- `PATCH /api/v1/inquiries/:id` — edit client info / `value` (estimated deal value) / assignedTo
- `PATCH /api/v1/inquiries/:id/stage` — `{ stage, lostReason? }` — the drag-and-drop move; rejects anything not in the fixed pipeline
- `DELETE /api/v1/inquiries/:id`

### Tags

- `POST /api/v1/inquiries/:id/tags` — `{ tag }`
- `DELETE /api/v1/inquiries/:id/tags/:tag`

### Quotation status

- `PATCH /api/v1/inquiries/:id/quotation` — `{ sent: true|false }`

### Conversation log (drawer)

- `GET /api/v1/inquiries/:id/logs`
- `POST /api/v1/inquiries/:id/logs` — `{ type: 'note'|'call'|'email'|'whatsapp'|'meeting', message }`

### Documents (drawer)

- `POST /api/v1/inquiries/:id/documents` — multipart, field `file`, optional `type: 'invoice'|'quotation'|'other'`
- `GET /api/v1/inquiries/:id/documents`
- `GET /api/v1/documents/:docId/download`
- `DELETE /api/v1/documents/:docId`

### Users (admin only)

- `GET /api/v1/users`
- `POST /api/v1/users` — `{ name, username, password, role? }`
- `PATCH /api/v1/users/:id`

### Meta

- `GET /api/v1/meta/pipeline` — returns the fixed stage list, so the frontend never has to hard-code it either
- `GET /api/v1/meta/team` — active team roster for assignment pickers (all authenticated roles)

## Not yet built (intentionally, per MOM scope)

- Dynamic pipeline stage customization — explicitly out of scope.
- Full invoice/quotation generation — only upload + sent/not-sent status for now.
- File storage is local disk (`uploads/`) for now; swap `src/middleware/upload.js` / `src/services/documentService.js` to S3/GCS when you're ready to deploy multi-instance (local disk won't survive across instances or restarts on most hosts).

## Next steps to discuss with Amal/Chandan

1. Confirm the exact field names the live Product/Service/Contact page forms
   will POST (I used sensible names — `clientName`, `productOrServiceName`,
   etc. — happy to adjust to match the frontend).
2. Decide on hosting for MongoDB (Atlas vs self-hosted) and file storage
   before this goes past local dev, and fill in real `.env.uat` /
   `.env.production` values (or wire them through your host's secret manager).
3. I haven't built the frontend Kanban/drawer UI yet — this is backend only,
   ready for the admin panel to consume.
