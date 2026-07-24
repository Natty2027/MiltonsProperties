import { z } from "zod";
import { isoTimestamp, timestamps, uuid } from "./common.js";

export const ScreeningProvider = z.enum(["singlekey", "transunion_smartmove", "checkr"]);
export type ScreeningProvider = z.infer<typeof ScreeningProvider>;

export const ScreeningStatus = z.enum(["pending", "ready", "error", "expired"]);
export type ScreeningStatus = z.infer<typeof ScreeningStatus>;

/**
 * A screening order references the provider's record by ID. We deliberately do
 * NOT store the raw report body, the SSN, or the bureau payload — that keeps the
 * breach surface manageable. Store the decision and the reason codes only.
 */
export const ScreeningOrder = z
  .object({
    id: uuid,
    applicationId: uuid,
    provider: ScreeningProvider,
    externalId: z.string().min(1),
    status: ScreeningStatus,
    consentId: uuid,
    reasonCodes: z.array(z.string()).default([]),
  })
  .merge(timestamps);
export type ScreeningOrder = z.infer<typeof ScreeningOrder>;

/**
 * Generated the instant a decline is recorded. This is the compliance artifact
 * most manual landlords never send — and the product's actual market position.
 */
export const AdverseAction = z
  .object({
    id: uuid,
    applicationId: uuid,
    agencyName: z.string().min(1),
    agencyContact: z.string().min(1),
    reason: z.string().min(1),
    /** FCRA: applicant may obtain a free copy within 60 days and dispute it. */
    disputeInstructions: z.string().min(1),
    generatedAt: isoTimestamp,
    deliveredAt: isoTimestamp.optional(),
  })
  .merge(timestamps);
export type AdverseAction = z.infer<typeof AdverseAction>;
