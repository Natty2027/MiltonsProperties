# Milton's Properties — Build Plan

Owner/realtor/renter platform for tracking sales, leases, and screening across a property portfolio.

---

## 1. The one thing that has to change about the spec

You described: renter applies → credit and background run automatically → owner gets an alert → approves or denies based on the reports.

Steps 1, 2, and 3 are fine. Step 4 is where the legal exposure lives, and it's the feature that will get the product sued if you ship it as described.

**Federal (FCRA).** Any decision touched by a consumer report — denial, higher deposit, requiring a cosigner, even asking for extra documentation — is "adverse action." It requires a written notice naming the reporting agency, stating the agency did not make the decision, and telling the applicant they can get a free copy within 60 days and dispute it. Willful noncompliance runs $1,000 per instance plus actual damages and attorney's fees. This is a per-applicant liability, so a high-volume automated system multiplies it fast.

**Fair housing.** HUD's guidance is that blanket criminal-history disqualifiers can violate the Fair Housing Act through disparate impact even though criminal record isn't a protected class. A hard-coded auto-reject rule is exactly the artifact a plaintiff's lawyer wants to find in discovery.

**San Francisco specifically.** The Fair Chance Ordinance (Police Code §49) bars asking about criminal history on the application form at all. Criminal history can only be reviewed *after* a conditional offer, must be assessed individually, and the applicant must get a chance to present evidence of rehabilitation. The Ninth Circuit upheld this model in 2023 while striking down Seattle's broader ban — so SF's version is the tested one. Oakland and Berkeley are stricter still.

**California AB 2493**, effective Jan 1 2025, changes the mechanics: written screening criteria must be given to the applicant *before* you take a fee, applications must be processed in the order received (if you use the first-qualified path, the first applicant who meets your posted criteria must be approved), the fee is capped near $66 and adjusts with CPI, unused fees refund within 7 days, and a copy of the credit report goes to the applicant within 7 days automatically. **AB 2559** forces you to accept a portable screening report under 30 days old without charging again.

**What to build instead.** Keep the speed, move the automation to the right place:

- Automate the *evidence gathering* — credit, income, eviction, ID — not the verdict.
- Auto-clear the clean ones. If an applicant meets every posted criterion, the system says "meets criteria, ready to approve" and the owner taps once. That's the instant experience you wanted, and under AB 2493's first-qualified path it's actually the compliant answer.
- Route anything short of a clean pass to a human review screen with a reason, never an auto-deny.
- Gate criminal history behind the conditional offer, as a separate step with its own screen.
- Generate the adverse action notice automatically the instant a decline is recorded. This is where software genuinely beats a landlord with a spreadsheet — most manual landlords simply never send it.

That last point is your actual market position. "Milton's makes sure you never miss an adverse action notice" is a better pitch to owners than "instant auto-reject," and it's defensible.

---

## 2. Architecture

```
                 ┌──────────────────────────────────┐
   Owner (iOS)   │                                  │
   Realtor (web) ├──►  API — Node/TypeScript        │
   Renter (web)  │     Fastify + Zod                │
                 │                                  │
                 └────────┬─────────────────────────┘
                          │
        ┌─────────────────┼──────────────────┬─────────────────┐
        ▼                 ▼                  ▼                 ▼
   PostgreSQL        Screening          Notifications      Payments
   + Drizzle         (SingleKey /       (Twilio SMS,       (Stripe ACH
   + RLS             TransUnion         Expo push,         for rent,
                     SmartMove /        Resend email)      escrow via
                     Checkr)                               title co.)
        │
        ▼
   S3 / R2 — photos, leases, signed consents, generated notices
```

**Stack.** This is deliberately your existing Cognivate stack so you're not learning anything new: React Native/Expo for the owner app, React + Vite for the web, Express or Fastify + TypeScript, Drizzle ORM on Postgres, Clerk for auth. The one addition is row-level security in Postgres — with three tenant-facing roles and SSNs in flight, application-layer auth checks alone aren't enough.

**Core tables.**

| Table | Notes |
|---|---|
| `organizations` | Multi-owner from day one. Retrofitting this is painful. |
| `properties` | Address, unit, type, beds/baths/sqft, status, owner_id |
| `listings` | Rent/price, posted criteria (frozen at publish), photos |
| `applications` | applicant_id, listing_id, `received_at` — this timestamp is your AB 2493 ordering proof |
| `screening_orders` | provider, external_id, status, consent_id, **never store raw report bodies** |
| `consents` | Signed FCRA authorization, IP, timestamp, document hash |
| `approval_requests` | The realtor→owner object. kind, terms, amount, status, decided_at, decided_by |
| `adverse_actions` | Generated notice, delivery receipt, retention |
| `audit_log` | Append-only. Who saw what, when. Non-negotiable for FCRA defense. |

**The screening data rule.** Store the decision and the reason codes. Do not store the report PDF, the SSN, or the raw bureau payload in your own database. Reference the provider's record by ID and re-fetch on demand. This shrinks your breach surface from catastrophic to manageable, and it's what your insurer will ask about.

---

## 3. Integrations

| Need | Pick | Why |
|---|---|---|
| Credit + eviction + criminal | **SingleKey API** (Equifax/TransUnion, public REST docs, returns in minutes) or **TransUnion SmartMove** | SingleKey has the cleanest developer docs and an applicant-facing secure portal, which keeps SSN collection off your servers entirely |
| Background alternative | **Checkr** | Better if you also screen your own contractors; pay their rates directly rather than a PMS upcharge |
| Income verification | **Plaid Income** | Bank-verified beats uploaded pay stubs, and it's harder to forge |
| ID verification | **Persona** or **Stripe Identity** | Catches the fraud screening alone misses |
| Rent collection | **Stripe ACH** | ~$0.80 flat vs. 2.9% on cards; rent on cards is a losing economic |
| Notifications | **Twilio** + **Expo Push** + **Resend** | Push carries the approve/decline action buttons |
| E-signature | **Documenso** (self-host) or **Dropbox Sign** | Consent forms and leases |
| Listing syndication | **RESO Web API** via your MLS; Zillow feed | Phase 3 — not needed for a private portfolio |

**Getting screening access.** Every provider will run a site inspection or credentialing review before turning on production credit data. Expect proof of business registration, a physical address, a signed end-user certification of permissible purpose, and sometimes photos of your office. Budget 2–6 weeks. Start this application on day one of the build, not at the end — it's the longest lead item in the whole project.

---

## 4. Phasing

**Phase 1 — the approval loop (4–6 weeks).** Properties, portfolio board, realtor submits a transaction, owner gets push and approves or declines, activity log. No screening. This alone is a sellable product and it's the piece your cousin can demo.

**Phase 2 — listings and applications (4–6 weeks).** Public listing pages with photos, application form, posted criteria, consent capture, application queue in received order, manual owner decision. Still no bureau integration — this validates the flow while your screening credentialing is in review.

**Phase 3 — screening (4–6 weeks).** Wire the provider. Criteria-matching engine that outputs *meets / does not meet / needs review* with reason codes. Conditional offer step. Individualized assessment screen for criminal history. Automated adverse action generation and delivery receipt.

**Phase 4 — money (4 weeks).** Rent collection via ACH, autopay, late fee rules, owner statements, 1099 export.

**Phase 5 — scale.** Maintenance requests, vendor dispatch, syndication, multi-owner white label.

---

## 5. Running costs at small scale

| Item | Monthly |
|---|---|
| Hosting (Railway/Fly + Neon Postgres) | $40–90 |
| Clerk auth | $0–25 |
| Twilio SMS | $10–30 |
| S3/R2 storage | $5–15 |
| Screening | Per-report, ~$25–40, passed through to applicant within the CA cap |
| E-sign | $0 self-hosted / $15+ hosted |
| **Total fixed** | **≈$70–160/mo** |

Not in that table and larger than all of it: **errors & omissions plus cyber liability insurance.** You are handling SSNs and making housing decisions. Get quoted before you launch — expect $1,500–4,000/yr — and have a lawyer review your consent form, screening criteria template, and adverse action template. That review is a few thousand dollars and it is the cheapest line item in the project relative to what it prevents.

---

## 6. The remote move-in, and its two hard limits

Sign, pay, photograph, get keys — all remote, no in-person handoff. That works. Two pieces of it can't be built the way they'd naturally be built.

**You cannot make the portal the only way to pay.** Civil Code §1947.3 requires a landlord to allow at least one payment method that is neither cash nor electronic funds transfer — check or money order. The provision can't be waived; a lease clause that tries is void as against public policy. You also can't charge a fee for paying by check. So the payment screen always carries a mail-a-check option, and it can't be quietly buried. Practically: keys release on funds clearing, which for a check means a few days later. Offer a small autopay discount to steer people toward ACH rather than trying to force it.

**The deposit is capped.** AB 12 amended Civil Code §1950.5 effective July 1 2024: one month's rent, furnished or not, with pet deposits and any "last month's rent" counted inside that cap. The two-month exception is narrow — natural persons (or an LLC whose members are all natural persons) owning no more than two rental properties totalling no more than four units — and it never applies to active-duty service members, who keep the one-month protection regardless. Build the cap as a server-side validation, not a UI hint, with the small-landlord test and the service-member flag as inputs. Getting it wrong exposes you to two times the deposit in statutory damages.

**Also in the move-in flow:** AB 2801 requires move-in condition photographs as of July 1 2025, which is why the walkthrough upload is a gated step rather than optional. And the 21-day itemized-statement deadline for any deposit deductions hasn't changed.

**One thing to watch on "no in-person interaction."** A fully digital path is a real convenience, but it can't be the *only* path. Someone without a smartphone, without a bank account, or with a disability that makes the app unusable still has to be able to rent from you — refusing to accommodate them is a fair housing problem, not a product decision. Keep a phone-and-paper track available and staffed. It'll be a small fraction of applicants and it removes a whole category of risk.

---

## 7. What's in the prototype

Open `miltons-properties.html` in any browser. No build step, no dependencies.

Three roles in the header:

- **Owner** — portfolio board with a status rail on every unit, rent roll, decision cards. Approve or decline and the portfolio, activity log and the renter's move-in checklist all update.
- **Realtor** — assigned properties, "Start a transaction," and a board of what's submitted and where it stands.
- **Renter** — the full journey. Every unit opens to a **criteria disclosure gate** before you can apply: a two-column panel listing exactly what you can be denied for and what you cannot, each with the statute attached, plus a plain warning that meeting the criteria doesn't guarantee the unit. Applying requires two separate acknowledgements. The pipeline then advances stage by stage, the Fair Chance notice appears at the conditional-offer step, and the outcome is either a move-in checklist or a fully drafted adverse action notice.

Two things worth trying specifically:

- Apply with an income *below* 2.5× annual rent. The system declines and renders the adverse action notice with the reason, the agency's contact details, the statement that the agency didn't make the decision, and the dispute path. That notice is the compliance artifact most landlords never send.
- Get approved, open the move-in checklist, then tick "I am an active-duty service member." The deposit recalculates to the one-month cap in front of you.

The disclosure panel is the design argument for the whole product. Every competitor hides the screening rules; showing them, with citations, is both the compliant move and the trustworthy one.

Fonts load from Google Fonts, so first load needs a connection. Everything else runs offline in memory.

---

*Compliance summary above reflects federal FCRA, HUD guidance, California Civil Code §§1947.3, 1950.5 and 1950.6 as amended by AB 12, AB 2493, AB 2559 and AB 2801, and SF Police Code §49, as of mid-2026. Laws change and local ordinances vary sharply by city — Oakland and Berkeley are materially stricter than San Francisco on criminal screening. I'm not a lawyer, and this is a build spec rather than legal advice. Have counsel review the consent form, the criteria template, the adverse action template and the lease before you take a single application.*
