# Milton's Properties

An owner / realtor / renter platform for a small California property portfolio —
tracking sales, leases, and tenant screening. This repository is a **proof of
concept**: a working prototype and iOS shell, plus a typed backend/web scaffold
that shows how the full product is architected.

The product thesis, in one line: **the only rental platform where the tenant
sees the same record the landlord sees.** The compliance work every California
landlord already owes (posted screening criteria, move-in condition photos,
ordered applications, adverse-action notices) becomes the product surface
instead of buried paperwork. Full rationale in [`docs/`](docs/).

## Monorepo layout

```
apps/
  ios/        SwiftUI shell (WKWebView) hosting the interactive prototype  [runnable]
  web/        Vite + React web app, consumes @workspace/shared             [runnable]
services/
  api/        Fastify + TypeScript + Drizzle (Postgres) API                [skeleton]
packages/
  shared/     Zod schemas + inferred types — the domain contract           [runnable]
docs/
  build-plan.md   Architecture, integrations, compliance, phasing
  features.md     The differentiating feature spec
```

Status legend: **runnable** works today; **skeleton** is wired correctly
(routes, schema, DB client) and boots against in-memory fixtures, ready to be
backed by a real database.

This is a **pnpm workspace** with a shared dependency `catalog:` and a
`minimumReleaseAge` supply-chain guard, matching the conventions of the
Cognivate monorepo.

## Quickstart

Requires Node ≥ 20 and pnpm 9. (`corepack enable` will provide pnpm.)

```bash
pnpm install

pnpm dev          # web app        → http://localhost:5173
pnpm dev:api      # API            → http://localhost:3001  (GET /health)
pnpm typecheck    # typecheck every package
pnpm build        # build web + api + shared
```

### The web demo

`pnpm dev` serves a landing page with a **live free-pre-qualification** widget.
It runs the exact `prequalify()` from `@workspace/shared` — the same function the
API serves at `POST /applications/prequalify` — so the web and the API always
agree. No credit report, no inquiry: it is arithmetic against a listing's posted
criteria, deliberately outside FCRA.

### The iOS app

The interactive prototype (roles: owner / realtor / renter, the criteria
disclosure gate, the adverse-action notice, the deposit cap recalculation) ships
inside `apps/ios` as a single `Web/index.html`, hosted in a `WKWebView`.

```bash
brew install xcodegen
cd apps/ios
xcodegen generate
open MiltonsProperties.xcodeproj   # set your team under Signing, then ⌘R
```

See [`apps/ios/README.md`](apps/ios/README.md) for the full build notes.

## The shared contract

`@workspace/shared` is the single source of truth for domain shapes. Each schema
maps to a core table in the build plan — `Property`, `Listing`, `Application`,
`Consent`, `ScreeningOrder`, `AdverseAction`, `ApprovalRequest`, `AuditLogEntry`.
The API validates requests against these Zod schemas at its boundary; the web app
imports the inferred TypeScript types. Internal packages export TypeScript source
directly (resolved via the `workspace` condition), so there is no build step
between editing a type and using it.

## A note on the screening data rule

The API schema enforces the build plan's core safety rule *by omission*: it
stores screening **decisions and reason codes**, never the raw report body, the
SSN, or the bureau payload. That is what shrinks the breach surface from
catastrophic to manageable.

---

*Prototype for demonstration. The statutory mechanics referenced in `docs/` are
current to mid-2026 and are not legal advice — have counsel review the consent
form, screening criteria, adverse-action template, and lease before launch.*
