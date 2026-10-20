# Project context — Holy Coffee Server

This document records the current, verified context of the Holy Coffee backend. It is based on the repository implementation and configuration that exist today. It is not a product roadmap, and it must not be used as evidence that an endpoint, field, role, or business rule has already been implemented.

## Purpose and boundaries

HolyCoffeeServer is a Node.js backend for the Holy Coffee application. The intended product is a food and beverage ordering experience supporting Divine and Holy stores/products, delivery and pickup, wallet transactions, rewards, and order reviews. The current codebase provides only the foundation for authenticated user access and profile management. The implemented scope is intentionally small: Firebase ID-token verification, MongoDB user lookup/creation, authenticated user retrieval, and authenticated profile updates.

The product flow below is the requested product context. It describes planned behavior, not endpoints or database fields that already exist. Future business capabilities must be added only after their API and data contracts are approved and implemented in the repository.

## Requested product flow

### Authentication

1. A user authenticates with their phone number.
2. Firebase Authentication sends and verifies the OTP.
3. The client sends the resulting Firebase ID token to this backend.
4. The backend verifies the token and resolves the authoritative application user. The backend must not trust a client-submitted user ID, role, wallet owner, or order owner.

### Location, stores, categories, and products

1. After authentication, the user sets or selects their location.
2. The application shows stores available for that location.
3. The application shows the categories available for the selected store/location.
4. The user opens a product details screen.
5. Product details indicate whether the product is available through **Divine**, **Holy**, or both. The exact meaning of Divine and Holy, and whether they are stores, brands, menus, or fulfillment options, still requires confirmation before schema design.

### Cart and checkout

1. The user adds products to a cart.
2. On the cart screen, the user can review, add, remove, and change item quantities before checkout.
3. Checkout contains the delivery address, order summary, selected items, and available payment methods.
4. The user selects an order type: **delivery** or **pickup**.
5. The backend recalculates authoritative prices, availability, fees, discounts, and totals at checkout. Client-submitted totals must not be trusted.
6. A successful order requires an idempotent and auditable checkout operation so retries cannot create duplicate orders or duplicate charges.

### Order status, delivery, and pickup

1. The user can view and track their order.
2. Tracking must support both delivery and pickup order flows, with statuses and timestamps defined by the approved order contract.
3. For a delivery order, the user can contact the assigned driver through an approved communication mechanism.
4. Driver identity and contact information must be limited to what is necessary for the active order and must be protected by order-level authorization.
5. Pickup instructions, store handoff status, and any pickup verification requirement remain to be defined.

### Profile

The user can view and edit their profile. Firebase remains the authentication authority for the phone identity; backend-editable profile fields must be explicitly allowlisted and validated.

### Wallet and transactions

The user has a wallet and can initiate these transaction types:

- **Top up:** add balance using an approved payment method.
- **Withdraw:** request removal of balance subject to the approved payout and verification policy.
- **Share balance:** transfer balance to another eligible user under an approved transfer policy.

Wallet balance and transaction history must be calculated from authoritative backend ledger records. Top-ups, withdrawals, and balance sharing require idempotency, authorization, auditable status transitions, and protection against double spending. The payment provider, withdrawal rules, fees, limits, recipient eligibility, reversals, and compliance requirements are not yet approved.

### Rewards

The user can earn or receive reward points and redeem eligible points for available rewards. The points ledger, earning rules, expiry, redemption validation, reversals, and relation to orders/wallet money must be approved before implementation. Points must not be treated as cash unless that is explicitly approved.

### Reviews

After an eligible order, the user can submit a review for that order. The backend must verify that the reviewer owns the order and that the order is in an eligible completed state. Review targets, rating scale, editing/deletion policy, moderation, and whether users may review products, stores, drivers, or the whole order remain to be defined.

## Technology and runtime

- Node.js with Express 5 and strict TypeScript.
- CommonJS output compiled from `Src/` into `Dist/`.
- MongoDB accessed through Mongoose. The configured connection is read from `DB_URL`.
- Firebase Admin Authentication verifies bearer ID tokens.
- CORS is configured from `CORS_ORIGIN`.
- Environment values are loaded through `Src/configs/Environment.ts`.
- The application starts from `Src/server.ts`; it connects to MongoDB and then listens on `PORT` (default `3100`).
- `npm run build` invokes TypeScript compilation. `npm run dev` compiles and starts Node watch mode against `Dist/server.js`. `npm start` starts the compiled server.

The repository currently has no verified test, lint, or typecheck scripts beyond the build command shown above. Do not claim those checks have run unless scripts are added and executed.

## Current source structure

The repository uses the established capitalized directory casing:

```text
Src/
├── configs/       # environment, MongoDB connection, Firebase Admin setup
├── controllers/   # request handlers
├── interfaces/    # TypeScript shapes and Express request augmentation
├── middlewares/   # authentication and role middleware
├── models/        # Mongoose models
├── repositories/  # normal MongoDB access
├── routes/        # route composition
├── services/      # external-provider integration
└── server.ts      # Express bootstrap
```

There is currently one persisted model, `User`, and one repository, `UserRepository`. There is no verified implementation yet for locations, stores, categories, products, carts, orders, payment, wallet, delivery, drivers, rewards, reviews, inventory, or store management.

## Authentication and current user flow

Protected requests must send an `Authorization: Bearer <Firebase ID token>` header. `Passport.auth` verifies the token through Firebase Admin with revocation checking enabled, then calls `UserRepository.findOrCreateByFirebaseUid`.

The Firebase UID is the unique identity key. On first access, the repository creates a user using token-provided identity details and model defaults. Existing users are not overwritten with later token profile values because the repository uses `$setOnInsert`. Inactive users are rejected with HTTP 403. A successful request places the database user on `req.user`.

The current database role values are `buyer`, `seller`, and `admin`; status values are `active` and `inactive`. These are the values implemented by `IUser` and the Mongoose schema. They must not be replaced with unapproved role names or inferred permissions.

## Implemented API contract

The router mounts authenticated user routes under `/api/v1/user`.

| Method | Path | Authentication | Current behavior |
|---|---|---|---|
| GET | `/api/v1/user/me` | Firebase bearer token | Returns the authenticated user's public profile fields in `{ success: true, data: ... }`. |
| PATCH | `/api/v1/user/me` | Firebase bearer token | Updates only `name` and `photoUrl`; rejects unknown fields and invalid/empty updates. |

The implementation currently returns error envelopes shaped as `{ success: false, message, code }` for authentication, validation, and not-found failures. The root route `/` returns a plain health-style text response: `Helo from server side;`.

### Known implementation issue

`Src/controllers/Auth.Controller.ts` exports the handler as `get`, while `Src/routes/Auth.Route.ts` references `AuthController.me`. The current `npm run build` fails with `TS2339: Property 'me' does not exist`. This must be resolved before treating `GET /api/v1/user/me` as a working endpoint. The intended fix is a small naming alignment, but it is deliberately not applied by this documentation change.

## Current user data model

The `User` Mongoose model stores:

- `firebaseUid`: required, unique, indexed string.
- `name`: optional trimmed string.
- `email`: optional trimmed, lowercased string.
- `phoneNumber`: optional trimmed string.
- `photoUrl`: optional trimmed string.
- `role`: `buyer`, `seller`, or `admin`; defaults to `buyer`.
- `status`: `active` or `inactive`; defaults to `active`.
- `createdAt` and `updatedAt`: Mongoose timestamps.

MongoDB access follows the current route/middleware → controller → repository → Mongoose flow. Firebase verification is isolated in `AuthService`; ordinary user CRUD remains in `UserRepository`.

## Configuration and secrets

The current environment contract is documented by `.env.example`:

- `PORT` and `CORS_ORIGIN` control HTTP behavior.
- `DB_URL` is required for MongoDB.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` are required for Firebase Admin.
- Firebase web-application values are present as placeholders for client-side integration, but the inspected backend does not currently consume them.

`.env` contains secret-bearing values and must never be copied into documentation, logs, commits, or responses. The backend must not log bearer tokens, Firebase private keys, database credentials, or unnecessary personal data.

## Not yet defined

The following product and backend decisions are open and must be approved before implementation:

- Exact location semantics and the relationship between Divine and Holy.
- Product/catalog, cart, order, payment, delivery, inventory, store, wallet, rewards, and review entities.
- Role capabilities and record-level authorization for each future feature.
- Whether `buyer`, `seller`, and `admin` remain the approved roles and how they map to business responsibilities.
- API versioning and final request/response schemas beyond the current user routes.
- Pagination, filtering, sorting, idempotency, and concurrency rules for future state-changing operations.
- Payment provider, webhook verification, refund behavior, and financial audit requirements.
- Delivery provider/driver workflow, driver contact mechanism, tracking source, and pickup handoff rules.
- Wallet ledger, supported payment and payout methods, transaction limits, transfer rules, fees, reversals, and compliance requirements.
- Rewards earning/redemption rules, point expiry, and reward catalog.
- Review targets, rating scale, moderation, and eligibility rules.
- File/image storage policy. Cloudinary is listed as a dependency, but no storage flow was verified in the current source.
- Caching policy. `node-cache` is listed as a dependency, but no cache usage was verified in the current source.
- Square integration. The package is installed, but no payment implementation was verified in the current source.
- Deployment environments, backups, monitoring, rate limits, retention, and operational ownership.

Until these decisions are approved and implemented, they remain proposals rather than backend facts.

## Engineering guardrails

- Keep routes limited to method/path/middleware/validator/controller composition.
- Keep normal MongoDB access in repositories and external-provider calls in services.
- Keep controllers as plain objects and preserve the repository's existing casing and module structure.
- Validate request body, params, and query values at the boundary as the API grows.
- Enforce authorization using backend state; never treat a submitted user ID, role, or ownership field as proof of permission.
- Use atomic/idempotent operations for duplicate-sensitive workflows such as orders, payments, and inventory changes.
- Preserve audit history for financial, permission, and other sensitive changes.
- Never add secrets to source control or expose provider credentials in API responses.
- Add tests under a root `tests/` directory when the corresponding feature is implemented.

## Source-of-truth precedence

For implemented behavior, use the actual source code, schemas, route registration, and verified API contract. `AGENTS.md` and `docs/ARCHITECTURE_POLICY.md` provide engineering instructions and guardrails. This project context records current facts and approved decisions only; it must be updated when the implementation or an approved product decision changes.
