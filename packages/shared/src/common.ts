import { z } from "zod";

/**
 * Primitives shared across every entity. Kept in one place so the ID and
 * timestamp shapes never drift between the API, the web app, and the DB layer.
 */

export const uuid = z.string().uuid();
export const isoTimestamp = z.string().datetime({ offset: true });

/** Money is stored and moved as integer cents to avoid float drift. */
export const cents = z.number().int().nonnegative();

/** US 2-letter state code, upper-cased. */
export const usState = z
  .string()
  .length(2)
  .transform((s) => s.toUpperCase());

export const timestamps = z.object({
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp,
});

/** The three tenant-facing roles from the build plan. */
export const Role = z.enum(["owner", "realtor", "renter"]);
export type Role = z.infer<typeof Role>;

/** A self-reported credit band — used for free pre-qualification, never a report. */
export const CreditBand = z.enum(["poor", "fair", "good", "very_good", "excellent"]);
export type CreditBand = z.infer<typeof CreditBand>;
