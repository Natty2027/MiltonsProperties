import { z } from "zod";
import { Role, cents, isoTimestamp, timestamps, uuid } from "./common.js";

/** The realtor -> owner object. The core of the Phase 1 approval loop. */
export const ApprovalKind = z.enum(["lease", "sale", "price_change", "concession"]);
export type ApprovalKind = z.infer<typeof ApprovalKind>;

export const ApprovalStatus = z.enum(["pending", "approved", "declined"]);
export type ApprovalStatus = z.infer<typeof ApprovalStatus>;

export const ApprovalRequest = z
  .object({
    id: uuid,
    propertyId: uuid,
    requestedBy: uuid,
    kind: ApprovalKind,
    amountCents: cents.optional(),
    terms: z.string().optional(),
    status: ApprovalStatus,
    decidedAt: isoTimestamp.optional(),
    decidedBy: uuid.optional(),
  })
  .merge(timestamps);
export type ApprovalRequest = z.infer<typeof ApprovalRequest>;

/** Append-only. Who saw what, when. Non-negotiable for FCRA defense. */
export const AuditLogEntry = z.object({
  id: uuid,
  actorId: uuid,
  actorRole: Role,
  action: z.string().min(1),
  entity: z.string().min(1),
  entityId: uuid,
  at: isoTimestamp,
});
export type AuditLogEntry = z.infer<typeof AuditLogEntry>;
