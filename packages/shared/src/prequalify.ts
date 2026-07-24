import type { ListingCriteria } from "./property.js";
import type { CreditBand } from "./common.js";
import type { PreQualResult } from "./application.js";

const CREDIT_BAND_FLOOR: Record<CreditBand, number> = {
  poor: 550,
  fair: 620,
  good: 680,
  very_good: 740,
  excellent: 800,
};

const DISCLAIMER =
  "Meeting these criteria does not guarantee the unit. This is an estimate based on the posted criteria — no credit report is pulled and no inquiry is recorded.";

/**
 * Free pre-qualification: pure arithmetic against a listing's posted criteria.
 * Deliberately outside FCRA — no consumer report, no credit inquiry.
 *
 * Shared by the API (`POST /applications/prequalify`) and the web app so the
 * number a renter sees is computed exactly one way.
 */
export function prequalify(
  criteria: ListingCriteria,
  monthlyRentCents: number,
  applicant: { monthlyIncomeCents: number; creditBand: CreditBand },
): PreQualResult {
  const requiredMonthlyIncomeCents = Math.round(monthlyRentCents * criteria.minIncomeMultiple);
  const reasons: string[] = [];

  if (applicant.monthlyIncomeCents < requiredMonthlyIncomeCents) {
    reasons.push(
      `Income is below the required ${criteria.minIncomeMultiple}x rent for this unit.`,
    );
  }

  if (criteria.minCreditScore != null) {
    const estimated = CREDIT_BAND_FLOOR[applicant.creditBand];
    if (estimated < criteria.minCreditScore) {
      reasons.push(
        `Self-reported credit band ("${applicant.creditBand}") is below the posted minimum of ${criteria.minCreditScore}.`,
      );
    }
  }

  return {
    meets: reasons.length === 0,
    requiredMonthlyIncomeCents,
    reasons,
    disclaimer: DISCLAIMER,
  };
}
