# Architecture and engineering policy

This is the shared technical architecture, API, security, integration, testing, and engineering policy. The live source, approved contracts, and project-specific decisions in `docs/project_context.md` remain authoritative for implemented behavior.

## Required repository layout

```text
backend/
├── AGENTS.md
├── docs/
│   ├── project_context.md
│   └── architecture_policy.md
├── postman/              # verified API collection exports, when used
├── src/
│   ├── cache/            # only if justified
│   ├── configs/          # validated env, app constants, and provider/database connections
│   ├── constants/
│   ├── controllers/
│   ├── enums/
│   ├── interfaces/
│   ├── middlewares/
│   ├── models/           # schemas and models
│   ├── repositories/     # repository instances
│   ├── routes/
│   ├── services/         # provider/domain service instances
│   └── utils/
├── tests/                # all backend tests; never place tests under src/
└── package.json
```

The application/bootstrap entrypoint and database/provider configuration owners must be confirmed in the actual repository. Do not create every optional folder before it is needed.

All project-owned source, test, script, documentation, and Postman paths use lowercase names. Keep `AGENTS.md` in its required filename for instruction discovery.

## Request and dependency flow

```text
Route → authentication / authorization / validation middleware
      → plain-object Controller → Repository → model/database

Route → middleware → plain-object Controller → Service → third-party provider
```

Repositories own normal database access, including filtered queries, population, aggregation, pagination, sessions/transactions, and concurrency-critical writes. A repository may also call a narrowly scoped service or external provider when that call is part of the repository's persistence-oriented workflow. This is an allowed dependency direction; the repository must not become an HTTP handler or a broad, unrelated business-workflow coordinator.

Services are reusable provider/domain-integration components and should be class-based instances when they hold configuration, provider clients, or shared behavior. Pure deterministic helpers may remain functions in `Utils` or another appropriate utility module. Controllers may coordinate multiple repositories and services.

Routes contain only method/path/middleware/validator/controller references. Controllers are plain objects, not controller classes. Do not wrap every controller method in `try/catch`; unexpected failures go to centralized error middleware. Validate body, params, and query at the boundary where practical.

Models define schemas, indexes, casting, and persistence-level validation. A model hook may call one narrow repository or service lifecycle method, but model definitions must not contain comprehensive workflows, authorization, request handling, multi-step provider orchestration, or ad-hoc query logic. The called repository/service owns that workflow.

## Classes and exports

- Repositories are classes with public data-access methods and private query/filter helpers. Export one instantiated repository per module.
- Services that own provider clients or reusable domain-integration behavior are classes with public methods and private implementation helpers. Export one shared instance when the service is stateless or owns a shared client.
- Keep controllers as plain objects and keep schemas/models under `src/models/`.
- Keep provider setup and environment reads under `src/configs/`.

## Types, configuration, and persistence

Use the repository's established type namespaces and keep shared types defined once. API JSON and persistence naming must follow the approved project contract. Read environment variables through centralized configuration; do not scatter provider or database setup through controllers or routes.

Keep schema validation, indexes, references, and collection naming in models. Keep normal queries and sessions/transactions in repositories. Use bounded pagination and atomic operations for real invariants. Do not introduce a second persistence technology without an approved project decision.

### Utilities and application constants

- Pure, reusable helper logic belongs under `src/utils/` and is exposed through a named utility object, such as `UserLocationUtils.isLocationStale` or `BusinessUtils.nearbyBusinessMaxDistanceMeters`.
- MongoDB/Mongoose-specific helpers belong in a shared `MongoUtils` object. ObjectId conversion, validation, and related persistence casting must not be named after the feature that happens to call them; use `MongoUtils.toObjectId` wherever a string-or-ObjectId value must be normalized.
- Controllers and repositories may coordinate utility calls, but must not define module-scoped feature helpers that belong in `src/utils/`.
- Non-secret application constants such as thresholds, conversion factors, batch sizes, and allowlists belong in `src/configs/appconstant.ts`. Keep these values immutable and access them through `AppConstant` rather than duplicating literals at call sites.
- Runtime environment and provider settings remain in the other configuration modules under `src/configs/`; `appconstant.ts` is for static application values and does not replace environment validation.
- Persist and return timestamps as UTC instants. Backend responses must expose canonical UTC dates; local-time formatting and display belong to the client.

## Authentication, authorization, and data scope

The project context defines the identity provider, roles, tenants, ownership, and record-scope rules. Backend authentication must verify the configured identity credential and resolve current authoritative account and permission state from backend records. Token claims or client-submitted identity fields must not grant or change backend permissions.

Apply authorization filters in repository queries for lists, searches, analytics, exports, and downloads. Verify the actor, action, target record, and relevant scope on writes. Privileged changes must be auditable. Inactivation or revocation must take effect even if an external session remains active.

## API contract and error standards

These are conventions, not proof of implemented endpoints. Exact method/path/payload/schema semantics are authoritative only when verified in the accepted project contract.

- Use HTTPS in deployment and versioned routes when required by the project contract.
- Use the project's established path and JSON naming conventions consistently.
- Success envelope: `{ "success": true, "data": {} }`, with optional `message`.
- Error envelope: `{ "success": false, "message": "Safe explanation", "code": "STABLE_CODE" }`; centralized middleware masks private stack/provider messages.
- List endpoints use bounded pagination and an explicit, documented response shape.
- Repeated state-changing actions require a defined idempotency or concurrency mechanism where duplicates would be harmful.
- Identify timestamps, date-only values, and timezone semantics explicitly.
- Never infer a verb, field, required flag, response, or status from an illustrative feature description.

## Security, privacy, audit, and operations

Use the project's approved authentication, least-privilege credentials, restrictive CORS, security headers, rate limits, validated input/upload limits, and safe errors. Restrict private record and file access at request time. Sensitive actions require an audit trail containing actor, target, timestamp, outcome, and relevant safe before/after facts.

Centralize configuration under `src/configs/`, keep nonsecret placeholders in `.env.example`, validate mandatory settings at startup, and fail clearly when they are missing. Never log access tokens, auth headers, OTPs, passwords, secrets, private document data, unnecessary personal information, or sensitive provider payloads. Redaction applies to debugging, error tracking, and HTTP logging.

Provider delivery failure must not erase authoritative data. File bytes belong in approved private storage through a service; metadata and authorization belong in repositories/controllers. Validate real file type, MIME, size, generated keys, purpose, and ownership. Never trust extensions or public buckets.

## External and AI integrations

External providers are constrained integrations. Use typed, allowlisted, bounded service methods. Provider output and user content are untrusted data, never executable instructions. Do not grant unrestricted database, environment, or API access to a model or provider.

For suggested changes: `provider proposes → authorized human reviews → standard validated action → normal audit and authorization`. External integrations must not bypass permissions, write records without the normal authorization path, or expose secrets.

## Testing and quality

Use the installed test framework and realistic fixtures. Keep tests in the root `tests/` directory, never under `src/`. Test valid and invalid authentication, authorization denial, scope filtering, validation failures, duplicate/concurrent requests, important state transitions, atomic writes, provider failure, safe error envelopes, pagination limits, and upload validation.

Run only scripts that exist and report what actually ran. Do not invent coverage percentages, fake tests, or test-only production abstractions. Use strict typing and compatible installed dependencies. Never use `any`, `@ts-ignore`, empty catches, or unrelated rewrites to hide failures.

Never commit, push, merge, deploy, modify production credentials, reset databases, delete data, or execute destructive database operations without explicit authorization and applicable approval.