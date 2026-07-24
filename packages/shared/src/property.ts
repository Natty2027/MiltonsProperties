import { z } from "zod";
import { cents, timestamps, usState, uuid } from "./common.js";

export const PropertyStatus = z.enum([
  "draft",
  "listed",
  "application_pending",
  "leased",
  "sold",
  "off_market",
]);
export type PropertyStatus = z.infer<typeof PropertyStatus>;

export const PropertyType = z.enum(["apartment", "house", "condo", "townhouse", "duplex"]);
export type PropertyType = z.infer<typeof PropertyType>;

export const Address = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: usState,
  postalCode: z.string().min(5),
});
export type Address = z.infer<typeof Address>;

export const Property = z
  .object({
    id: uuid,
    organizationId: uuid,
    ownerId: uuid,
    address: Address,
    unit: z.string().optional(),
    type: PropertyType,
    beds: z.number().int().nonnegative(),
    baths: z.number().nonnegative(),
    sqft: z.number().int().positive().optional(),
    status: PropertyStatus,
  })
  .merge(timestamps);
export type Property = z.infer<typeof Property>;

/**
 * Posted screening criteria are frozen at publish time (AB 2493). This is the
 * exact ruleset the free pre-qualification check runs against.
 */
export const ListingCriteria = z.object({
  minIncomeMultiple: z.number().positive().describe("Monthly income must be >= rent * this"),
  minCreditScore: z.number().int().min(300).max(850).optional(),
  vouchersAccepted: z.boolean().default(true),
  notes: z.string().optional(),
});
export type ListingCriteria = z.infer<typeof ListingCriteria>;

export const Listing = z
  .object({
    id: uuid,
    propertyId: uuid,
    /** Monthly rent (rentals) or list price (sales), in cents. */
    priceCents: cents,
    forSale: z.boolean().default(false),
    /** Frozen at publish — never mutated after applicants see it. */
    criteria: ListingCriteria,
    photoUrls: z.array(z.string().url()).default([]),
    publishedAt: z.string().datetime({ offset: true }).optional(),
  })
  .merge(timestamps);
export type Listing = z.infer<typeof Listing>;
