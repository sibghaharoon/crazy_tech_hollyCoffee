# AGENTS.md — Holy Coffee Server (Codex / ChatGPT)

## Mandatory references
Before any non-trivial change, read:
- `docs/project_context.md`
- `docs/architecture_policy.md`
- the actual repository implementation.

The actual code and approved backend contract establish **what is implemented**; these documents describe the intended design and guardrails. If they disagree, report the conflict before changing behavior. Never silently use a proposed endpoint, field, policy, or permission as an implemented fact.

Do not modify `AGENTS.md`, `CLAUDE.md`, or any file under `docs/` unless explicitly asked. This instruction does not prevent initial creation of these files when explicitly requested.

## Working method
1. Inspect existing code, package scripts, schemas, indexes, and related tests.
2. Find the smallest affected feature and trace its current request/data flow.
3. Reuse existing routes, controllers, repositories, models, namespaces, validators, middlewares, services, and helpers.
4. Check business rules, authorization, location scope, concurrency, and API contract before editing.
5. Make the smallest safe change. Do not reorganize modules or add abstract layers merely from preference.
6. Update relevant tests and **only when authorized to edit docs**, relevant API docs/Postman exports.
7. Run applicable lint, typecheck, tests, schema/index checks, and build; report what actually ran and failed.
8. State assumptions and unresolved product decisions. Do not pretend new project plans are existing code.

## Required stack and structure
Node.js + Express + TypeScript (`strict: true`) + MongoDB/Mongoose. Firebase Authentication handles phone-number OTP authentication; the backend verifies Firebase ID tokens and owns application data and authorization. Zod should be used when new request validators are introduced. ESLint, Prettier, and Postman conventions apply when configured; Vitest is preferred for new tests. Do not add Redis/BullMQ, Sentry, or other packages unless justified/approved according to engineering policy.

```text
Src/
├── configs/           # environment, database, Firebase, and provider setup
├── constants/         # only when needed
├── controllers/
├── enums/             # only when needed
├── interfaces/
├── middlewares/
├── models/            # Mongoose schemas and models
├── repositories/
├── routes/
├── services/          # external-provider integrations
├── utils/             # only when needed
├── validators/        # only when needed
└── server.ts        # Express app and startup bootstrap
tests/               # all backend tests; never place tests under Src/
postman/             # verified API collection exports
```

Do not create every optional folder or file before it is needed. Keep the established casing of this repository: `Src/` with lowercase subdirectories such as `configs`, `controllers`, `interfaces`, `middlewares`, `models`, `repositories`, `routes`, and `services`. Startup entrypoint and package scripts are to be confirmed in the actual repo.

## Architecture rules
Database flow: `Route → Middleware / Zod → Controller → Repository → Mongoose → MongoDB`.
External integration: `Route → Middleware / Zod → Controller → Service → provider`.
Controllers may coordinate repositories and services; repositories own **all normal application database access**, including transactions. Services handle Firebase, push, mail, object storage, AI, and other third-party infrastructure—not ordinary CRUD. Routes declare paths, middleware, validators, controller references; no substantial business logic or DB calls in routes.

Use **plain-object controllers**, not controller classes. Do not wrap every controller method in `try/catch`; unexpected failures go to centralized error middleware. Zod validates body, params, and query before the controller where practical.

Each feature has one type-only `I<Feature>` namespace in `Src/interfaces/i<feature>.ts`, with feature-owned shapes such as `Model`, `CreateObj`, and `UpdateObj`; share cross-feature types instead of duplicating them. `IAuth` contains only authentication-specific types and references user types when needed. API JSON fields and Mongoose document fields use the established camelCase convention. Keep Mongoose schemas/models in `Src/models/` and keep persistence MongoDB-specific.

## Authentication, roles, and user scope
Verify Firebase ID tokens on the backend, then find or create the MongoDB `User` by the verified Firebase UID. Firebase handles phone-number OTP authentication; the backend must not treat a client-submitted OTP, user ID, role, wallet owner, order owner, or location as authorization proof. Existing role/status values are backend-controlled and must not be replaced from token claims.

The currently implemented `User.role` values are `buyer`, `seller`, and `admin`, with `active`/`inactive` status. Their detailed business permissions are not yet finalized. For planned location-based stores, products, orders, delivery, pickup, wallet, rewards, and reviews, enforce both action and record-level authorization using authoritative backend records. A selected location is a context input, not proof of access.

## Business-critical invariants
- Location selection must constrain store, category, product availability, delivery, and pickup options according to authoritative backend records.
- Product availability and prices must be revalidated on cart changes and checkout; never trust client-submitted totals or availability.
- Cart and checkout operations must be safe for retries and must not create duplicate orders or duplicate payment charges.
- Order state transitions, delivery/pickup tracking, driver assignment, and driver contact must be authorized to the relevant order and recorded with timestamps.
- Wallet top-ups, withdrawals, and balance sharing must use an authoritative ledger, idempotency, atomic balance changes, and an audit trail. Never silently overwrite wallet transactions or allow double spending.
- Rewards points must have a ledger and must not be treated as cash unless an approved contract explicitly says so. Redemption and reversal rules must be enforced server-side.
- Reviews must be tied to an eligible completed order and must be protected from unauthorized edits or submissions.
- Do not expose unnecessary user, driver, address, payment, wallet, or order data to other users.
- External providers and AI, if later added, never bypass roles, expose hidden records, invent business figures, or change orders, payments, wallets, rewards, or profiles without the normal authorization and audit path.

## API, errors, and safety
Expose versioned routes under `/api/v1`, lowercase kebab-case paths. The Holy Coffee flow in `docs/project_context.md` is planned product context, not proof that routes already exist; finalize each contract before coding. Use company JSON envelopes, sensible HTTP codes, shared error types, centralized error middleware, pagination defaults, and a maintained `postman/` collection. Do not invent DB columns, endpoints, environment names, request/response fields, role matrices, wallet limits, reward rules, payment methods, delivery statuses, or review policies.

Never log tokens, credentials, OTPs, private documents, payment details, wallet secrets, addresses, driver contact data, or unnecessary personal information. Protect secret-bearing configuration, apply least privilege, use safe upload URLs, and audit sensitive actions. Firebase phone authentication is not a substitute for application-level authorization or transaction verification.

## Quality and production
Use transactions for multi-record atomic changes. Add constraints/indexes tied to real invariants; avoid unbounded reads and N+1 queries. Test invalid/expired Firebase tokens, inactive users, location-scope denial, cart price/availability changes, duplicate checkout/payment attempts, order ownership, delivery/pickup transitions, driver-contact access, wallet double-spend/replay cases, balance sharing, reward redemption, and review eligibility. Use applicable `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` **if those scripts exist**; never claim checks ran when they did not.

Never commit, push, merge, deploy, modify production, reset databases, run destructive database operations, or change secrets without explicit instruction and applicable approval. No `any`, `@ts-ignore`, empty catches, fake tests, or unrelated rewrites to hide failures. See `docs/architecture_policy.md`.
