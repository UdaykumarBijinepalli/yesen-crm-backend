# Yesen CRM Backend — API Documentation

Interactive Swagger UI and a Postman collection for every current backend
endpoint. Prefer this file + Swagger for day-to-day API work; the root
`README.md` covers architecture and setup.

---

## Quick links

| Resource | Location |
| -------- | -------- |
| **Swagger UI** (browser) | http://localhost:5000/api-docs |
| **OpenAPI JSON** | http://localhost:5000/api-docs.json |
| **OpenAPI source** | `src/docs/openapi.js` |
| **Postman collection** | [`Yesen-CRM-API.postman_collection.json`](./Yesen-CRM-API.postman_collection.json) |
| **Postman environment** | [`Yesen-CRM-Local.postman_environment.json`](./Yesen-CRM-Local.postman_environment.json) |

Base path: **`/api/v1`** (unversioned `/api/...` alias also works).

---

## Prerequisites

```bash
cd yesen-crm-backend
cp .env.development.example .env.development   # if not already done
pnpm install
pnpm seed:dev          # admin user
pnpm seed:demo:dev     # optional demo inquiries
pnpm dev               # http://localhost:5000
```

Default seeded login (from `.env.development`):

| Field | Value |
| ----- | ----- |
| Username | `admin` |
| Password | `ChangeMe123!` |

Forms key header must match `FORMS_API_KEY` in your env (example default:
`change_this_forms_key_min_8_chars`).

---

## Swagger UI

1. Start the backend (`pnpm dev`).
2. Open http://localhost:5000/api-docs .
3. Click **Authorize**:
   - **bearerAuth** — paste the JWT from `POST /api/v1/auth/login`.
   - **formsApiKey** — paste your `FORMS_API_KEY` for public form routes.
4. Use **Try it out** on any operation.

Swagger is mounted outside the `/api` rate limiter so browsing docs is not
throttled. Spec is generated from `src/docs/openapi.js` (kept in sync with
the live routes).

---

## Postman

1. Open Postman → **Import**.
2. Import:
   - `docs/Yesen-CRM-API.postman_collection.json`
   - `docs/Yesen-CRM-Local.postman_environment.json`
3. Select environment **Yesen CRM Local**.
4. Confirm `baseUrl` and `formsApiKey` match your local setup.
5. Run **Auth → Login** — a test script saves `{{token}}` automatically.
6. Run **Forms → Product inquiry** (or copy an id from the Kanban board) to
   populate `{{inquiryId}}`.

Collection auth is Bearer `{{token}}`. Form requests send `x-forms-key`
instead and use no JWT.

---

## Authentication

| Audience | Mechanism |
| -------- | --------- |
| Admin panel (staff + admin) | `Authorization: Bearer <JWT>` from login |
| Website form intake | Header `x-forms-key: <FORMS_API_KEY>` |
| Health | None |

Roles:

- **admin** — full CRM + `/users` management
- **staff** — full CRM (pipeline, drawer, docs); **cannot** call `/users`

Errors are JSON: `{ "error": "...", "requestId": "...", "details": ... }`.

---

## Endpoint catalogue

### Health

| Method | Path | Auth |
| ------ | ---- | ---- |
| `GET` | `/health` | none |

### Auth

| Method | Path | Auth | Body / notes |
| ------ | ---- | ---- | ------------ |
| `POST` | `/api/v1/auth/login` | none | `{ username, password }` → `{ token, user }` |
| `GET` | `/api/v1/auth/me` | Bearer | current user |
| `PATCH` | `/api/v1/auth/password` | Bearer | `{ currentPassword, newPassword }` |

### Forms (public intake)

Require `x-forms-key`. At least one of `email` or `phone`; `clientName` or `name`.

| Method | Path | Auto-tag |
| ------ | ---- | -------- |
| `POST` | `/api/v1/forms/product` | `productOrServiceName` (required) |
| `POST` | `/api/v1/forms/service` | `productOrServiceName` (required) |
| `POST` | `/api/v1/forms/contact` | `"Open"` |

Optional fields: `company`, `message`, `sourcePage`, `value`.

### Inquiries / Kanban

All require Bearer.

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/api/v1/inquiries?board=true` | `{ columns: [{ stage, cards }] }` |
| `GET` | `/api/v1/inquiries` | Flat list; query: `tag`, `source`, `q`, `assignedTo` (`ObjectId` or `unassigned`) |
| `GET` | `/api/v1/inquiries/:id` | Drawer: `{ inquiry, logs, documents }` |
| `PATCH` | `/api/v1/inquiries/:id` | Client fields, `value`, `assignedTo` |
| `PATCH` | `/api/v1/inquiries/:id/stage` | `{ stage, lostReason? }` |
| `DELETE` | `/api/v1/inquiries/:id` | Also removes logs + documents |
| `POST` | `/api/v1/inquiries/:id/tags` | `{ tag }` |
| `DELETE` | `/api/v1/inquiries/:id/tags/:tag` | |
| `PATCH` | `/api/v1/inquiries/:id/quotation` | `{ sent: true\|false }` |

Hard-coded stages:

`Inquired` → `Contacted` → `Quotation Provided` → `Negotiation` → `Completed` / `Lost`

### Interaction logs

| Method | Path | Body |
| ------ | ---- | ---- |
| `GET` | `/api/v1/inquiries/:id/logs` | |
| `POST` | `/api/v1/inquiries/:id/logs` | `{ type?, message }` — type: `note` \| `call` \| `email` \| `whatsapp` \| `meeting` |

### Documents

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/api/v1/inquiries/:id/documents` | |
| `POST` | `/api/v1/inquiries/:id/documents` | multipart: field `file`, optional `type` (`invoice` \| `quotation` \| `other`) |
| `GET` | `/api/v1/documents/:docId/download` | file download |
| `DELETE` | `/api/v1/documents/:docId` | |

### Users (admin only)

| Method | Path | Body |
| ------ | ---- | ---- |
| `GET` | `/api/v1/users` | |
| `POST` | `/api/v1/users` | `{ name, username, password, email?, role? }` |
| `PATCH` | `/api/v1/users/:id` | `{ name?, email?, role?, active?, password? }` |

### Meta

| Method | Path | Notes |
| ------ | ---- | ----- |
| `GET` | `/api/v1/meta/pipeline` | Fixed `stages` + `sources` |
| `GET` | `/api/v1/meta/team` | Active roster for assignment pickers (all roles) |

---

## Suggested smoke flow (Postman or Swagger)

1. `GET /health`
2. `POST /auth/login` → copy token
3. `GET /meta/pipeline`
4. `POST /forms/service` (with forms key) → copy inquiry id
5. `GET /inquiries?board=true`
6. `GET /inquiries/:id`
7. `PATCH /inquiries/:id/stage` → `Contacted`
8. `POST /inquiries/:id/logs`
9. `PATCH /inquiries/:id/quotation` → `{ "sent": true }`
10. `POST /inquiries/:id/documents` (file upload)

---

## Keeping docs in sync

When you add or change a route:

1. Update validators + controllers as usual.
2. Update `src/docs/openapi.js` (Swagger + `/api-docs.json`).
3. Update this file’s catalogue if the change is user-facing.
4. Add/adjust the matching request in `Yesen-CRM-API.postman_collection.json`.
