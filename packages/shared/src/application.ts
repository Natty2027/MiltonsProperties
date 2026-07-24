import { z } from "zod";
import { CreditBand, cents, isoTimestamp, timestamps, uuid } from "./common.js";

export const ApplicationStatus = z.enum([
  "received",
  "meets_criteria",
  "needs_review",
  "conditional_offer",
  "approved",
  "declined",
  "withdrawn",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const Application = z
  .object({
    id: uuid,
    listingId: uuid,
    applicantId: uuid,
    status: ApplicationStatus,
    /** AB 2493 ordering proof — first-qualified is decided by this timestamp. */
    receivedAt: isoTimestamp,
    consentId: uuid.optional(),
  })
  .merge(timestamps);
export type Application = z.infer<typeof Application>;

/**
 * Signed FCRA authorization. We store the metadata and a document hash — never
 * the raw form body or the SSN.
 */
export const Consent = z
  .object({
    id: uuid,
    applicationId: uuid,
    signedAt: isoTimestamp,
    ipAddress: z.string().ip(),
    documentHash: z.string().min(1),
  })
  .merge(timestamps);
export type Consent = z.infer<typeof Consent>;

// ---- Free pre-qualification (ships in the prototype) --------------------
//
// Pure arithmetic against a listing's posted criteria. No consumer report, no
// credit inquiry — deliberately outside FCRA.

export const PreQualRequest = z.object({
  listingId: uuid,
  monthlyIncomeCents: cents,
  creditBand: CreditBand,
});
export type PreQualRequest = z.infer<typeof PreQualRequest>;

export const PreQualResult = z.object({
  meets: z.boolean(),
  requiredMonthlyIncomeCents: cents,
  reasons: z.array(z.string()),
  /** Plain reminder that meeting criteria is not a guarantee of the unit. */
  disclaimer: z.string(),
});
export type PreQualResult = z.infer<typeof PreQualResult>;
