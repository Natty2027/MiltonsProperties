import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Drizzle schema — one table per core entity in docs/build-plan.md.
 *
 * The screening-data rule from the build plan is enforced by omission: we store
 * decisions and reason codes, never the raw report body, SSN, or bureau payload.
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const roleEnum = pgEnum("role", ["owner", "realtor", "renter"]);

export const propertyStatusEnum = pgEnum("property_status", [
  "draft",
  "listed",
  "application_pending",
  "leased",
  "sold",
  "off_market",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "received",
  "meets_criteria",
  "needs_review",
  "conditional_offer",
  "approved",
  "declined",
  "withdrawn",
]);

export const approvalKindEnum = pgEnum("approval_kind", [
  "lease",
  "sale",
  "price_change",
  "concession",
]);

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ...timestamps,
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  role: roleEnum("role").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  ...timestamps,
});

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  address: jsonb("address").notNull(),
  unit: text("unit"),
  type: text("type").notNull(),
  beds: integer("beds").notNull(),
  baths: integer("baths").notNull(),
  sqft: integer("sqft"),
  status: propertyStatusEnum("status").notNull().default("draft"),
  ...timestamps,
});

export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  priceCents: integer("price_cents").notNull(),
  forSale: boolean("for_sale").notNull().default(false),
  // Posted criteria are frozen at publish (AB 2493).
  criteria: jsonb("criteria").notNull(),
  photoUrls: jsonb("photo_urls").notNull().default([]),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  ...timestamps,
});

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id")
    .references(() => listings.id)
    .notNull(),
  applicantId: uuid("applicant_id")
    .references(() => users.id)
    .notNull(),
  status: applicationStatusEnum("status").notNull().default("received"),
  // AB 2493 ordering proof.
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  ...timestamps,
});

export const consents = pgTable("consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id")
    .references(() => applications.id)
    .notNull(),
  signedAt: timestamp("signed_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address").notNull(),
  documentHash: text("document_hash").notNull(),
  ...timestamps,
});

export const screeningOrders = pgTable("screening_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id")
    .references(() => applications.id)
    .notNull(),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  status: text("status").notNull().default("pending"),
  consentId: uuid("consent_id")
    .references(() => consents.id)
    .notNull(),
  // Decision + reason codes only — never the raw report body.
  reasonCodes: jsonb("reason_codes").notNull().default([]),
  ...timestamps,
});

export const approvalRequests = pgTable("approval_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .references(() => properties.id)
    .notNull(),
  requestedBy: uuid("requested_by")
    .references(() => users.id)
    .notNull(),
  kind: approvalKindEnum("kind").notNull(),
  amountCents: integer("amount_cents"),
  terms: text("terms"),
  status: text("status").notNull().default("pending"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  decidedBy: uuid("decided_by").references(() => users.id),
  ...timestamps,
});

export const adverseActions = pgTable("adverse_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationId: uuid("application_id")
    .references(() => applications.id)
    .notNull(),
  agencyName: text("agency_name").notNull(),
  agencyContact: text("agency_contact").notNull(),
  reason: text("reason").notNull(),
  disputeInstructions: text("dispute_instructions").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  ...timestamps,
});

// Append-only. Who saw what, when. Non-negotiable for FCRA defense.
export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").notNull(),
  actorRole: roleEnum("actor_role").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: uuid("entity_id").notNull(),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
});
